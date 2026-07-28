// ── Прогресс на сервере ──
//
// GET  — отдать прогресс этого пользователя
// POST — сохранить (сервер сам сливает с тем, что уже лежит в базе,
//        чтобы устройство со старыми данными не затёрло свежие)
//
// Кто именно обращается, определяем по подписи Telegram — заголовок
// X-Telegram-Init-Data. Без верной подписи запрос отклоняется.

import { verifyInitData } from "../../../lib/telegram-auth";
import { dbConfigured, upsertUser, getProgress, putProgress } from "../../../lib/supabase";
import { mergeProgress } from "../../../lib/storage";

export const dynamic = "force-dynamic";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

function auth(request) {
  const initData = request.headers.get("x-telegram-init-data");
  return verifyInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
}

export async function GET(request) {
  if (!dbConfigured()) return json({ ok: false, reason: "db_not_configured" }, 503);

  const user = auth(request);
  if (!user) return json({ ok: false, reason: "unauthorized" }, 401);

  try {
    const data = await getProgress(user.id);
    // Отмечаем визит; профиль создастся, если человек здесь впервые
    await upsertUser(user);
    return json({ ok: true, progress: data, user: { id: user.id, firstName: user.firstName } });
  } catch (e) {
    return json({ ok: false, reason: "db_error", message: String(e.message || e) }, 500);
  }
}

export async function POST(request) {
  if (!dbConfigured()) return json({ ok: false, reason: "db_not_configured" }, 503);

  const user = auth(request);
  if (!user) return json({ ok: false, reason: "unauthorized" }, 401);

  let incoming;
  try {
    const body = await request.json();
    incoming = body && body.progress;
  } catch { return json({ ok: false, reason: "bad_body" }, 400); }
  if (!incoming || typeof incoming !== "object") return json({ ok: false, reason: "bad_body" }, 400);

  try {
    const stored = await getProgress(user.id);
    // Тем же правилом, что и на клиенте: ничего не теряем, берём максимум
    const merged = mergeProgress(stored, incoming);
    await putProgress(user.id, merged);
    await upsertUser(user, { reason: merged.reason, goal: merged.goal });
    return json({ ok: true, progress: merged });
  } catch (e) {
    return json({ ok: false, reason: "db_error", message: String(e.message || e) }, 500);
  }
}
