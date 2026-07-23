// Генерация озвучки казахских фраз через ElevenLabs (мультиязычная модель).
//
// Запуск:
//   ELEVEN_API_KEY=<ключ> node scripts/gen-audio.mjs
// Опционально:
//   ELEVEN_VOICE_ID=<id голоса>   (по умолчанию — мягкий женский)
//
// Что делает:
//   • собирает все казахские фразы из data/course.js и data/dialogs.js
//   • для каждой запрашивает mp3 у ElevenLabs (модель eleven_multilingual_v2)
//   • кладёт файлы в public/audio/<hash>.mp3
//   • пишет карту data/audioManifest.js (фраза → файл)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const KEY = process.env.ELEVEN_API_KEY;
// "Rachel" — стабильный универсальный голос ElevenLabs. Можно заменить своим.
const VOICE_ID = process.env.ELEVEN_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const MODEL = process.env.ELEVEN_MODEL || "eleven_multilingual_v2";

if (!KEY) {
  console.error("❌ Нужна переменная окружения ELEVEN_API_KEY.");
  console.error("   Пример: ELEVEN_API_KEY=sk_xxx node scripts/gen-audio.mjs");
  process.exit(1);
}

// Короткий стабильный хэш строки → имя файла
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

async function synth(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, speed: 0.9 },
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const course = await import(pathToFileURL(path.join(ROOT, "data/course.js")).href);
  const dlg = await import(pathToFileURL(path.join(ROOT, "data/dialogs.js")).href);

  const phrases = new Set();
  for (const l of course.lessons) for (const p of l.phrases) phrases.add(p.kk);
  for (const d of dlg.dialogs) {
    for (const s of d.steps) {
      phrases.add(s.bot.kk);
      for (const o of s.options) phrases.add(o.kk);
    }
  }

  const list = [...phrases].filter(Boolean);
  console.log(`Фраз к озвучке: ${list.length}. Модель: ${MODEL}, голос: ${VOICE_ID}\n`);

  const outDir = path.join(ROOT, "public/audio");
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = {};
  let done = 0, failed = 0;
  for (const text of list) {
    const file = `${hash(text)}.mp3`;
    const dest = path.join(outDir, file);
    try {
      if (!fs.existsSync(dest)) {
        const buf = await synth(text);
        fs.writeFileSync(dest, buf);
        await new Promise((r) => setTimeout(r, 250)); // бережём лимит запросов
      }
      manifest[text] = file;
      done++;
      process.stdout.write(`\r✓ ${done}/${list.length}`);
    } catch (e) {
      failed++;
      console.warn(`\n⚠ Не удалось: "${text}" — ${e.message}`);
    }
  }

  const js =
    `// Автогенерация scripts/gen-audio.mjs — не редактировать вручную.\n` +
    `export const AUDIO = ${JSON.stringify(manifest, null, 2)};\n`;
  fs.writeFileSync(path.join(ROOT, "data/audioManifest.js"), js);

  console.log(`\n\nГотово: ${done} озвучено, ${failed} с ошибкой.`);
  console.log(`Файлы: public/audio/  ·  карта: data/audioManifest.js`);
}

main().catch((e) => { console.error(e); process.exit(1); });
