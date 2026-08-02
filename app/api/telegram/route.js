// ── Вебхук Telegram-бота ──
//
// Telegram шлёт сюда обновления (updates). На команду /start отвечаем
// именным приветствием и кнопкой, которая открывает мини-приложение
// прямо внутри Telegram (inline-кнопка типа web_app).
//
// Что нужно, чтобы это заработало (одноразово):
//   1. Переменные окружения на Vercel:
//        TELEGRAM_BOT_TOKEN       — токен бота из BotFather
//        APP_URL                  — адрес мини-приложения, напр. https://sitkaz.kz
//        TELEGRAM_WEBHOOK_SECRET  — любая случайная строка (защита вебхука)
//   2. Зарегистрировать вебхук (один раз, из терминала):
//        curl "https://api.telegram.org/bot<ТОКЕН>/setWebhook?url=https://sitkaz.kz/api/telegram&secret_token=<СЕКРЕТ>"

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const dynamic = "force-dynamic";

// Вызов метода Bot API
async function tg(token, method, body) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch { /* не валим вебхук из-за сетевой ошибки */ }
}

// Приветствие. По языку Telegram выбираем русский или английский; казахская
// строка одинакова для всех — это первое слово, которое учит человек.
function greeting(name, code) {
  const en = (code || "").startsWith("en");
  const hi = name ? `Сәлем, ${name}!` : "Сәлем!";
  const body = en
    ? "This is sitkaz — a friendly way to learn spoken Kazakh: short situational phrases, cards, quizzes and a snow-leopard guide named Irbis. Tap below to open the app and take your first step. 🏔"
    : "Это sitkaz — простой способ учить разговорный казахский: короткие ситуативные фразы, карточки, квизы и барс-проводник Ирбис. Нажми кнопку ниже, открой приложение и сделай первый шаг. 🏔";
  return `${hi}\n\n${body}`;
}

export async function POST(request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return json({ ok: false, reason: "bot_not_configured" }, 503);

  // Проверяем, что запрос действительно от Telegram (секрет из setWebhook)
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return json({ ok: false, reason: "forbidden" }, 403);
  }

  let update;
  try { update = await request.json(); } catch { return json({ ok: true }); }

  const msg = update && update.message;
  const text = (msg && msg.text) || "";

  if (msg && msg.chat && /^\/start\b/.test(text)) {
    const from = msg.from || {};
    const url = process.env.APP_URL || "https://sitkaz.kz";
    const en = (from.language_code || "").startsWith("en");
    await tg(token, "sendMessage", {
      chat_id: msg.chat.id,
      text: greeting(from.first_name, from.language_code),
      reply_markup: {
        inline_keyboard: [[
          { text: en ? "▶ Open sitkaz" : "▶ Открыть sitkaz", web_app: { url } },
        ]],
      },
    });
  }

  // Telegram ждёт 200, иначе будет повторять доставку
  return json({ ok: true });
}
