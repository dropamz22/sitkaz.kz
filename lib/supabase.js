// ── Обращения к базе Supabase (только сервер) ──
//
// Работаем через обычный HTTP-интерфейс Supabase, без дополнительной библиотеки:
// меньше зависимостей и нечему ломаться при обновлениях.
//
// Служебный ключ даёт полный доступ к базе, поэтому используется только здесь,
// на сервере, и никогда не попадает в браузер.

const url = () => process.env.SUPABASE_URL;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

export function dbConfigured() {
  return !!(url() && key());
}

async function rest(path, { method = "GET", body, prefer } = {}) {
  const res = await fetch(`${url()}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key(),
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`supabase ${method} ${path}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Профиль: создаём при первом входе, дальше только обновляем «был в сети»
export async function upsertUser(user, { reason, goal } = {}) {
  const row = {
    telegram_id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    username: user.username,
    language_code: user.languageCode,
    last_seen_at: new Date().toISOString(),
  };
  if (reason !== undefined) row.reason = reason;
  if (goal !== undefined) row.goal = goal;

  await rest("users?on_conflict=telegram_id", {
    method: "POST",
    body: row,
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function getProgress(telegramId) {
  const rows = await rest(`progress?telegram_id=eq.${encodeURIComponent(telegramId)}&select=data`);
  return rows && rows.length ? rows[0].data : null;
}

export async function putProgress(telegramId, data) {
  await rest("progress?on_conflict=telegram_id", {
    method: "POST",
    body: { telegram_id: telegramId, data, updated_at: new Date().toISOString() },
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}
