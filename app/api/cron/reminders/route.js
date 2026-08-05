// ── Ежедневные напоминания в Telegram ──
//
// Раз в день Vercel Cron вызывает этот маршрут (см. vercel.json). Мы берём всех
// учеников с прогрессом из Supabase и шлём каждому короткое сообщение через бота:
//   • серия под угрозой (был вчера, сегодня 0) — самый сильный повод вернуться;
//   • есть фразы на повторение;
//   • иначе — сколько фраз осталось до цели дня.
// Тех, кто сегодня уже позанимался, и тех, кто давно не заходил, не беспокоим.
//
// Что нужно в переменных окружения Vercel (кроме уже настроенных для приложения):
//   CRON_SECRET — любая случайная строка. Vercel сам шлёт её в заголовке
//                 Authorization: Bearer <CRON_SECRET>, а мы проверяем.

import { dbConfigured, listReminderTargets } from "../../../../lib/supabase";
import { doneToday, displayStreak, dueCount } from "../../../../lib/srs";

export const dynamic = "force-dynamic";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

// Русское склонение: 1 фраза, 2 фразы, 5 фраз
const plRu = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

function reminderText({ en, streak, today, goal, due }) {
  const left = Math.max(1, goal - today);
  // Серия под угрозой — вернуть в первую очередь
  if (streak > 0 && today === 0) {
    return en
      ? `🔥 Your ${streak}-day streak is at risk. Do a few phrases to keep it alive!`
      : `🔥 Твоя серия из ${streak} ${plRu(streak, "дня", "дней", "дней")} под угрозой. Пройди пару фраз, чтобы её сохранить!`;
  }
  if (due > 0) {
    return en
      ? `🔁 ${due} ${due === 1 ? "phrase is" : "phrases are"} waiting for review. Five minutes is enough.`
      : `🔁 ${due} ${plRu(due, "фраза ждёт", "фразы ждут", "фраз ждут")} повторения. Пяти минут хватит.`;
  }
  return en
    ? `🏔 ${left} ${left === 1 ? "phrase" : "phrases"} left to reach today's goal. Let's go!`
    : `🏔 Осталось ${left} ${plRu(left, "фраза", "фразы", "фраз")} до цели дня. Погнали!`;
}

async function sendMessage(token, chatId, text, url, en) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: {
          inline_keyboard: [[
            { text: en ? "▶ Open sitkaz" : "▶ Открыть sitkaz", web_app: { url } },
          ]],
        },
      }),
      cache: "no-store",
    });
    return true;
  } catch {
    return false; // не валим рассылку из-за одного заблокировавшего бота
  }
}

export async function GET(request) {
  // Защита: без верного секрета никого не рассылаем
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ ok: false, reason: "unauthorized" }, 401);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return json({ ok: false, reason: "bot_not_configured" }, 503);
  if (!dbConfigured()) {
    // Диагностика: показываем только наличие переменных (true/false), без значений.
    return json({
      ok: false,
      reason: "db_not_configured",
      env: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        CRON_SECRET: !!process.env.CRON_SECRET,
      },
    }, 503);
  }

  const url = process.env.APP_URL || "https://sitkaz.kz";
  const now = Date.now();
  const DORMANT_MS = 21 * 24 * 60 * 60 * 1000; // не беспокоим тех, кто пропал на 3+ недели

  let targets;
  try {
    targets = await listReminderTargets();
  } catch (e) {
    return json({ ok: false, reason: "db_error", message: String(e.message || e) }, 500);
  }

  let sent = 0, skipped = 0;
  for (const u of targets) {
    const data = u.data || {};
    if (!data.onboarded) { skipped++; continue; }

    const seen = u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : 0;
    if (seen && now - seen > DORMANT_MS) { skipped++; continue; }

    const goal = data.goal || u.goal || 10;
    const today = doneToday(data.streak);
    if (today >= goal) { skipped++; continue; } // сегодня уже позанимался — не мешаем

    const streak = displayStreak(data.streak);
    const due = dueCount(data.srs || {});
    const en = (u.languageCode || "").startsWith("en");
    const ok = await sendMessage(token, u.telegramId, reminderText({ en, streak, today, goal, due }), url, en);
    ok ? sent++ : skipped++;
  }

  return json({ ok: true, sent, skipped, total: targets.length });
}
