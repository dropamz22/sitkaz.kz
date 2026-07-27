// ── Хранилище прогресса ──
//
// Один интерфейс на два хранилища:
//   • Внутри Telegram — CloudStorage: прогресс живёт на серверах Telegram
//     и переезжает между телефоном и компьютером сам.
//   • В обычном браузере — localStorage: работает, но только на этом устройстве.
//
// Ограничения CloudStorage: до 1024 ключей, значение до 4096 символов,
// ключ — только латиница, цифры, дефис и подчёркивание. Прогресс с полностью
// пройденным курсом весит около 7000 символов, поэтому режем его на куски.
//
// Если завтра появится своя база — менять нужно только этот файл.

const LOCAL_KEY = "sitkaz_progress_v3";
const CHUNK_KEY = (n) => `progress_${n}`;   // куски прогресса
const META_KEY = "progress_meta";           // сколько кусков и когда сохраняли
const CHUNK_SIZE = 3800;                    // с запасом от лимита 4096

export const tg = () =>
  (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) || null;

// CloudStorage появился не во всех версиях Telegram — проверяем наличие
export function cloudAvailable() {
  const app = tg();
  return !!(app && app.CloudStorage && typeof app.CloudStorage.setItem === "function");
}

// ── localStorage ──────────────────────────────────────────────

export function loadLocal() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLocal(progress) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(progress)); } catch {}
}

// ── CloudStorage ──────────────────────────────────────────────

const cloudGet = (keys) =>
  new Promise((resolve) => {
    const cs = tg().CloudStorage;
    const done = (err, res) => resolve(err ? null : res);
    if (Array.isArray(keys)) cs.getItems(keys, done);
    else cs.getItem(keys, done);
  });

const cloudSet = (key, value) =>
  new Promise((resolve) => {
    tg().CloudStorage.setItem(key, value, (err, ok) => resolve(!err && ok !== false));
  });

const cloudRemove = (keys) =>
  new Promise((resolve) => {
    tg().CloudStorage.removeItems(keys, () => resolve(true));
  });

export async function loadCloud() {
  if (!cloudAvailable()) return null;
  try {
    const metaRaw = await cloudGet(META_KEY);
    if (!metaRaw) return null;
    const meta = JSON.parse(metaRaw);
    if (!meta || !meta.chunks) return null;

    const keys = Array.from({ length: meta.chunks }, (_, n) => CHUNK_KEY(n));
    const parts = await cloudGet(keys);
    if (!parts) return null;

    let json = "";
    for (let n = 0; n < meta.chunks; n++) {
      const piece = parts[CHUNK_KEY(n)];
      if (piece == null || piece === "") return null; // кусок потерялся — данным нельзя верить
      json += piece;
    }
    return JSON.parse(json);
  } catch { return null; }
}

export async function saveCloud(progress) {
  if (!cloudAvailable()) return false;
  try {
    const json = JSON.stringify(progress);
    const chunks = [];
    for (let i = 0; i < json.length; i += CHUNK_SIZE) chunks.push(json.slice(i, i + CHUNK_SIZE));

    for (let n = 0; n < chunks.length; n++) {
      const ok = await cloudSet(CHUNK_KEY(n), chunks[n]);
      if (!ok) return false;
    }
    // Старые лишние куски удаляем, иначе останется хвост от прошлой записи
    const prevMeta = await cloudGet(META_KEY);
    const prevChunks = prevMeta ? (JSON.parse(prevMeta).chunks || 0) : 0;
    if (prevChunks > chunks.length) {
      const extra = [];
      for (let n = chunks.length; n < prevChunks; n++) extra.push(CHUNK_KEY(n));
      await cloudRemove(extra);
    }
    return await cloudSet(META_KEY, JSON.stringify({ chunks: chunks.length, at: Date.now() }));
  } catch { return false; }
}

// ── Слияние ───────────────────────────────────────────────────

// Насколько «богат» прогресс: по нему решаем, чьи данные брать за основу.
export function weigh(p) {
  if (!p) return -1;
  return (Object.keys(p.done || {}).length * 100)
    + (Object.keys(p.srs || {}).length * 10)
    + (p.xp || 0);
}

// Первый вход с нового устройства: в облаке одно, локально другое.
// Ничего не теряем — берём более полный прогресс за основу и дополняем
// его тем, что есть только во втором.
export function mergeProgress(a, b) {
  if (!a) return b;
  if (!b) return a;
  const [base, other] = weigh(a) >= weigh(b) ? [a, b] : [b, a];

  const srs = { ...(other.srs || {}) };
  for (const [id, s] of Object.entries(base.srs || {})) {
    const prev = srs[id];
    // из двух записей об одной фразе оставляем более продвинутую
    srs[id] = !prev || (s.lvl || 0) >= (prev.lvl || 0) ? s : prev;
  }

  const streakA = base.streak || {};
  const streakB = other.streak || {};
  const streak = (streakA.count || 0) >= (streakB.count || 0) ? streakA : streakB;

  return {
    ...other,
    ...base,
    done: { ...(other.done || {}), ...(base.done || {}) },
    dialogs: { ...(other.dialogs || {}), ...(base.dialogs || {}) },
    achv: { ...(other.achv || {}), ...(base.achv || {}) },
    srs,
    streak,
    xp: Math.max(base.xp || 0, other.xp || 0),
    quizzes: Math.max(base.quizzes || 0, other.quizzes || 0),
    bestScore: Math.max(base.bestScore || 0, other.bestScore || 0),
    unlocked: !!(base.unlocked || other.unlocked),
    onboarded: !!(base.onboarded || other.onboarded),
  };
}

// ── Единый вход для приложения ────────────────────────────────

export async function loadProgress(EMPTY) {
  const local = loadLocal();
  if (!cloudAvailable()) return { progress: local ? { ...EMPTY, ...local } : EMPTY, synced: false };

  const cloud = await loadCloud();
  const merged = mergeProgress(cloud, local);
  const progress = merged ? { ...EMPTY, ...merged } : EMPTY;

  // Если слияние дало не то, что лежит в облаке, — сразу возвращаем актуальное состояние
  if (merged && JSON.stringify(merged) !== JSON.stringify(cloud)) saveCloud(progress);
  if (merged) saveLocal(progress);
  return { progress, synced: true };
}

// Пишем сразу локально (быстро и надёжно), в облако — с задержкой,
// чтобы не дёргать сеть на каждый ответ в карточке.
let cloudTimer = null;
export function saveProgress(progress, { delay = 1500 } = {}) {
  saveLocal(progress);
  if (!cloudAvailable()) return;
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => { saveCloud(progress); }, delay);
}

// Принудительная запись — например, когда приложение закрывают
export function flushProgress(progress) {
  if (cloudTimer) { clearTimeout(cloudTimer); cloudTimer = null; }
  saveLocal(progress);
  if (cloudAvailable()) saveCloud(progress);
}
