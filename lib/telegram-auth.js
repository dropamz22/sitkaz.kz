// ── Проверка подлинности пользователя Telegram (только сервер) ──
//
// Telegram передаёт мини-приложению строку initData с данными пользователя
// и подписью. Данные из неё нельзя принимать на веру: подделать telegram_id
// и прочитать чужой прогресс может кто угодно, пока подпись не проверена.
//
// Проверка описана в документации Telegram:
//   secret = HMAC_SHA256("WebAppData", токен_бота)
//   hash   = HMAC_SHA256(secret, строка_данных)
// Токен бота живёт в переменной окружения и на клиент никогда не попадает.

import crypto from "node:crypto";

const MAX_AGE_SEC = 24 * 60 * 60; // старше суток не принимаем

export function verifyInitData(initData, botToken) {
  if (!initData || !botToken) return null;

  let params;
  try { params = new URLSearchParams(initData); } catch { return null; }

  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  // Строка данных: пары «ключ=значение», отсортированные по ключу, через перевод строки
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  // Сравниваем за постоянное время, чтобы не подсказывать подбор по скорости ответа
  const a = Buffer.from(calculated, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Свежесть: старую подпись могли перехватить и переиспользовать
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Math.floor(Date.now() / 1000) - authDate > MAX_AGE_SEC) return null;

  try {
    const user = JSON.parse(params.get("user") || "null");
    if (!user || !user.id) return null;
    return {
      id: user.id,
      firstName: user.first_name || null,
      lastName: user.last_name || null,
      username: user.username || null,
      languageCode: user.language_code || null,
    };
  } catch { return null; }
}
