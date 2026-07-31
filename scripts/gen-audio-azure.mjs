// Генерация озвучки казахских фраз через Azure Speech (нейроголоса kk-KZ).
//
// У Azure есть родные казахские голоса — это лучший вариант для казахского:
//   • kk-KZ-AigulNeural  — женский (по умолчанию)
//   • kk-KZ-DauletNeural — мужской
//
// Запуск:
//   AZURE_SPEECH_KEY=<ключ> AZURE_SPEECH_REGION=<регион> node scripts/gen-audio-azure.mjs
// Опционально:
//   AZURE_VOICE=kk-KZ-DauletNeural     (голос; по умолчанию Aigul)
//   AZURE_RATE=-8%                     (темп речи, напр. медленнее на 8%)
//
// Где взять ключ и регион:
//   Azure Portal → создать ресурс «Speech» (есть бесплатный тариф F0) →
//   Keys and Endpoint → KEY 1 и Location/Region (напр. eastus, westeurope).
//
// Что делает:
//   • собирает все казахские фразы из data/course.js и data/dialogs.js
//   • для каждой запрашивает mp3 у Azure и кладёт в public/audio/<hash>.mp3
//   • пишет карту data/audioManifest.js (фраза → файл)
// Уже сгенерированные файлы пропускаются — можно догенерировать после правок курса.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
const VOICE = process.env.AZURE_VOICE || "kk-KZ-AigulNeural";
const RATE = process.env.AZURE_RATE || "-6%"; // чуть медленнее — так учебные фразы разборчивее

if (!KEY || !REGION) {
  console.error("❌ Нужны переменные окружения AZURE_SPEECH_KEY и AZURE_SPEECH_REGION.");
  console.error("   Пример: AZURE_SPEECH_KEY=xxxx AZURE_SPEECH_REGION=eastus node scripts/gen-audio-azure.mjs");
  process.exit(1);
}

const ENDPOINT = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

// Короткий стабильный хэш строки → имя файла (тот же алгоритм, что в gen-audio.mjs,
// поэтому имена файлов совпадают независимо от выбранного провайдера).
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

// Экранируем спецсимволы XML для SSML
const xmlEscape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function ssml(text) {
  return `<speak version="1.0" xml:lang="kk-KZ">` +
    `<voice name="${VOICE}"><prosody rate="${RATE}">${xmlEscape(text)}</prosody></voice>` +
    `</speak>`;
}

async function synth(text) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "sitkaz",
    },
    body: ssml(text),
  });
  if (!res.ok) {
    throw new Error(`Azure ${res.status}: ${await res.text()}`);
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
  console.log(`Фраз к озвучке: ${list.length}. Голос: ${VOICE}, регион: ${REGION}\n`);

  const outDir = path.join(ROOT, "public/audio");
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = {};
  let done = 0, failed = 0, skipped = 0;
  for (const text of list) {
    const file = `${hash(text)}.mp3`;
    const dest = path.join(outDir, file);
    try {
      if (fs.existsSync(dest)) {
        skipped++;
      } else {
        const buf = await synth(text);
        fs.writeFileSync(dest, buf);
        await new Promise((r) => setTimeout(r, 200)); // бережём лимит запросов
      }
      manifest[text] = file;
      done++;
      process.stdout.write(`\r✓ ${done}/${list.length}${skipped ? ` (готово ранее: ${skipped})` : ""}`);
    } catch (e) {
      failed++;
      console.warn(`\n⚠ Не удалось: "${text}" — ${e.message}`);
    }
  }

  const js =
    `// Автогенерация scripts/gen-audio-azure.mjs — не редактировать вручную.\n` +
    `export const AUDIO = ${JSON.stringify(manifest, null, 2)};\n`;
  fs.writeFileSync(path.join(ROOT, "data/audioManifest.js"), js);

  console.log(`\n\nГотово: ${done} озвучено (${skipped} уже были), ${failed} с ошибкой.`);
  console.log(`Файлы: public/audio/  ·  карта: data/audioManifest.js`);
}

main().catch((e) => { console.error(e); process.exit(1); });
