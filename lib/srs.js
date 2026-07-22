// ── Интервальное повторение (упрощённая система Лейтнера) ──
// У каждой фразы есть уровень (lvl) и дата следующего показа (due).
// «Знаю» → уровень растёт, интервал удлиняется: 1 → 3 → 7 → 21 → 60 дней.
// «Не знаю» → уровень сбрасывается, фраза вернётся уже сегодня.

export const INTERVALS = [0, 1, 3, 7, 21, 60]; // дней до следующего показа по уровням

export const phraseId = (p) => `${p.lessonId}:${p.kk}`;

export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const daysFromNow = (days) => todayStr(new Date(Date.now() + days * 86400000));

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Оценка ответа: возвращает новый объект srs
export function gradeSrs(srs, id, known) {
  const cur = srs[id] || { lvl: 0 };
  const lvl = known ? Math.min((cur.lvl || 0) + 1, INTERVALS.length - 1) : 0;
  return { ...srs, [id]: { lvl, due: daysFromNow(INTERVALS[lvl]) } };
}

// Сколько фраз ждут повторения сегодня
export function dueCount(srs) {
  const today = todayStr();
  return Object.values(srs).filter((s) => s.due <= today).length;
}

// Сколько фраз «выучено» (дошли до длинных интервалов)
export function learnedCount(srs) {
  return Object.values(srs).filter((s) => s.lvl >= 3).length;
}

// Колода для практики: сначала повторения, потом порция новых.
// Если повторять нечего и новых нет — свободная практика.
export function buildDeck(srs, phrases, { newLimit = 10, freeLimit = 15 } = {}) {
  const today = todayStr();
  const due = [];
  const fresh = [];
  for (const p of phrases) {
    const s = srs[phraseId(p)];
    if (!s) fresh.push(p);
    else if (s.due <= today) due.push(p);
  }
  if (due.length || fresh.length) {
    const freshPart = shuffle(fresh).slice(0, newLimit);
    return { cards: [...shuffle(due), ...freshPart], due: due.length, fresh: freshPart.length, free: false };
  }
  return { cards: shuffle(phrases).slice(0, freeLimit), due: 0, fresh: 0, free: true };
}

// ── Стрик и ежедневная цель ──
// streak: { count, last, todayCount }
export function registerActivity(st) {
  const today = todayStr();
  const s = st || { count: 0, last: null, todayCount: 0 };
  if (s.last === today) return { ...s, todayCount: (s.todayCount || 0) + 1 };
  const yesterday = todayStr(new Date(Date.now() - 86400000));
  return { count: s.last === yesterday ? (s.count || 0) + 1 : 1, last: today, todayCount: 1 };
}

// Стрик для показа: обнуляется, если пропущен день
export function displayStreak(st) {
  if (!st || !st.last) return 0;
  const today = todayStr();
  const yesterday = todayStr(new Date(Date.now() - 86400000));
  return st.last === today || st.last === yesterday ? st.count || 0 : 0;
}

// Сделано сегодня (для цели «N фраз в день»)
export function doneToday(st) {
  return st && st.last === todayStr() ? st.todayCount || 0 : 0;
}
