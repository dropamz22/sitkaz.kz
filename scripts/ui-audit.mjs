#!/usr/bin/env node
// ── Аудит интерфейса sitkaz ──
// Механические проверки, которые невозможно «не заметить глазами»:
//   1. className в JSX, для которых нет правила в CSS  (пример: .module-num — рисовался голым квадратом)
//   2. классы в CSS, которые нигде не используются     (мусор после рефакторингов)
//   3. :hover-правила без защиты для тач-устройств     (на телефоне подсветка «залипает» после тапа)
//   4. ключи t.* в коде, которых нет в словаре         (в интерфейсе покажется undefined)
//   5. ключи словаря, которые нигде не используются
//   6. рассинхрон ru/en словарей
//   7. русский текст, вшитый прямо в JSX мимо i18n
//   8. проверки данных курса: пустые поля, дубли фраз, одинаковые переводы
//
// Запуск:  node scripts/ui-audit.mjs        (код возврата 1, если есть ошибки)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const errors = [];
const warnings = [];
const err = (section, msg) => errors.push({ section, msg });
const warn = (section, msg) => warnings.push({ section, msg });

// ── Исходники ────────────────────────────────────────────────
const jsxFiles = [];
const walk = (dir) => {
  for (const f of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, f.name);
    if (f.isDirectory()) { if (!/node_modules|\.next|\.git/.test(rel)) walk(rel); }
    else if (/\.(jsx?|tsx?)$/.test(f.name)) jsxFiles.push(rel);
  }
};
walk("app");
if (fs.existsSync(path.join(root, "lib"))) walk("lib");

const jsxSrc = jsxFiles.map(read).join("\n");
const cssSrc = read("app/globals.css");
const i18nSrc = read("lib/i18n.js");

// ── 1-2. Классы: JSX ↔ CSS ───────────────────────────────────
const definedClasses = new Set();
// .foo { ... } — берём только селекторы классов, без псевдо и вложенности
for (const m of cssSrc.matchAll(/\.([a-zA-Z][\w-]*)/g)) definedClasses.add(m[1]);

// Классы, которые ставит библиотека/шрифт или задаются динамически
const IGNORE_UNDEFINED = new Set(["msi"]);
const IGNORE_UNUSED = new Set([]);

const usedClasses = new Set();
const dynamicPrefixes = new Set(); // className={"study-" + type} → проверяем по префиксу
// className="a b" | className={"a" + (x ? " b" : "")} | className={`a ${x}`}
for (const m of jsxSrc.matchAll(/className\s*=\s*(?:"([^"]*)"|\{([^}]*)\})/g)) {
  if (m[1] !== undefined) {
    for (const c of m[1].split(/\s+/)) if (c) usedClasses.add(c);
    continue;
  }
  // Внутри {...} убираем сравнения (lang === "en"), иначе значения примем за классы
  const expr = m[2].replace(/[=!]==?\s*["'`][^"'`]*["'`]/g, "");
  const prefixes = [];
  const plain = [];
  for (const lit of expr.matchAll(/["'`]([^"'`]*)["'`]/g)) {
    for (const c of lit[1].split(/\s+/)) {
      if (!c || c.includes("$")) continue;
      const name = c.replace(/^\./, "");
      if (name.endsWith("-")) { prefixes.push(name); dynamicPrefixes.add(name); }
      else plain.push(name);
    }
  }
  for (const name of plain) {
    // "phrase" в {"type-" + (p.type || "phrase")} — это не класс, а суффикс к префиксу
    const asSuffix = prefixes.map((p) => p + name).find((full) => definedClasses.has(full));
    if (asSuffix) { usedClasses.add(asSuffix); continue; }
    if (!definedClasses.has(name) && prefixes.length) continue; // значение данных, не класс
    usedClasses.add(name);
  }
}

// Классы, собранные в переменную: let cls = "quiz-opt"; cls += " correct";
for (const m of jsxSrc.matchAll(/\b(?:cls|className|classes)\s*\+?=\s*["'`]([^"'`]*)["'`]/g)) {
  for (const c of m[1].split(/\s+/)) if (c) usedClasses.add(c);
}

for (const c of usedClasses) {
  if (!definedClasses.has(c) && !IGNORE_UNDEFINED.has(c)) {
    err("классы", `.${c} используется в JSX, но не описан в globals.css — элемент останется без оформления`);
  }
}
// Динамические классы: должен существовать хотя бы один класс с таким началом
for (const pref of dynamicPrefixes) {
  if (![...definedClasses].some((c) => c.startsWith(pref))) {
    err("классы", `.${pref}* собирается в коде динамически, но в CSS нет ни одного такого класса`);
  }
}
const coveredByPrefix = (c) => [...dynamicPrefixes].some((p) => c.startsWith(p));
for (const c of definedClasses) {
  if (!usedClasses.has(c) && !IGNORE_UNUSED.has(c) && !coveredByPrefix(c)) {
    warn("классы", `.${c} описан в CSS, но нигде не используется`);
  }
}

// ── 3. :hover без защиты для тача ────────────────────────────
const touchBlock = cssSrc.split("@media (hover: none)")[1] || "";
const cssBeforeTouch = cssSrc.split("@media (hover: none)")[0];
for (const m of cssBeforeTouch.matchAll(/^\s*(\.[\w.\s>-]*?):hover\s*\{([^}]*)\}/gm)) {
  const sel = m[1].trim();
  const body = m[2];
  // Опасны только правила, меняющие вид: фон, цвет, рамку, фильтр, трансформ
  if (!/background|color|border|filter|transform|box-shadow/.test(body)) continue;
  if (touchBlock.includes(`${sel}:hover`)) continue;
  // Уточняющий селектор (.card.locked) закрыт сбросом базового (.card)
  const base = sel.split(".").slice(0, 2).join(".");
  if (base && base !== sel && touchBlock.includes(`${base}:hover`)) continue;
  err("hover", `${sel}:hover меняет вид, но не сброшен в @media (hover: none) — на телефоне подсветка залипнет после тапа`);
}

// ── 4-6. i18n ────────────────────────────────────────────────
const dictBlocks = {};
for (const langKey of ["ru", "en"]) {
  const re = new RegExp(`\\n  ${langKey}:\\s*\\{([\\s\\S]*?)\\n  \\},`, "m");
  const m = i18nSrc.match(re);
  if (!m) { err("i18n", `не найден словарь «${langKey}» в lib/i18n.js`); continue; }
  // Сначала выкидываем значения-строки, иначе «Correct answer:» примем за ключ answer
  const cleaned = m[1]
    .replace(/`(?:\\.|[^`\\])*`/g, '""')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, '""');
  const keys = new Set();
  for (const k of cleaned.matchAll(/(?:^|[\s{,])([a-z_][\w]*)\s*:/gm)) keys.add(k[1]);
  dictBlocks[langKey] = keys;
}
const ruKeys = dictBlocks.ru || new Set();
const enKeys = dictBlocks.en || new Set();

for (const k of ruKeys) if (!enKeys.has(k)) err("i18n", `ключ «${k}» есть в ru, но отсутствует в en — интерфейс сломается при переключении языка`);
for (const k of enKeys) if (!ruKeys.has(k)) err("i18n", `ключ «${k}» есть в en, но отсутствует в ru`);

const usedKeys = new Set();
for (const m of jsxSrc.matchAll(/\bt\.([a-z_][\w]*)/g)) usedKeys.add(m[1]);
for (const k of usedKeys) {
  if (!ruKeys.has(k)) err("i18n", `в коде используется t.${k}, но такого ключа нет в словаре — на экране будет пусто`);
}
for (const k of ruKeys) {
  if (!usedKeys.has(k)) warn("i18n", `ключ «${k}» есть в словаре, но нигде не используется`);
}

// ── 7. Русский текст мимо i18n ───────────────────────────────
// layout.jsx — метаданные сайта, они и должны быть на русском
const jsxOnly = jsxFiles.filter((f) => f.startsWith("app/") && !f.endsWith("layout.jsx"));
for (const file of jsxOnly) {
  const src = read(file);
  src.split("\n").forEach((line, n) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;          // комментарии
    if (/aria-label|alt=|console\.|placeholder=/.test(line)) return;
    // Кириллица внутри JSX-текста или строкового литерала
    const m = line.match(/>[^<>{}]*[а-яА-ЯёЁ]{3,}[^<>{}]*</) || line.match(/["'`][^"'`]*[а-яА-ЯёЁ]{3,}[^"'`]*["'`]/);
    if (m) warn("i18n", `${file}:${n + 1} — русский текст прямо в коде, не через словарь: ${m[0].trim().slice(0, 60)}`);
  });
}

// ── 8. Данные курса ──────────────────────────────────────────
const course = await import(path.join(root, "data/course.js"));
const { modules, lessons, allPhrases } = course;

for (const m of modules) {
  for (const f of ["id", "title", "subtitle", "subtitleEn", "color", "desc", "descEn", "icon"]) {
    if (!m[f]) err("данные", `модуль «${m.title || m.id}»: не заполнено поле ${f}`);
  }
}
for (const l of lessons) {
  for (const f of ["id", "module", "title", "ru", "en", "icon"]) {
    if (!l[f]) err("данные", `урок #${l.id} «${l.title || "?"}»: не заполнено поле ${f}`);
  }
  if (!l.phrases?.length) err("данные", `урок #${l.id} «${l.title}»: нет ни одной фразы`);
  if (!modules.some((m) => m.id === l.module)) err("данные", `урок #${l.id}: модуль «${l.module}» не существует`);
}

const lessonIcons = lessons.map((l) => l.icon);
const dupIcons = lessonIcons.filter((v, k) => lessonIcons.indexOf(v) !== k);
if (dupIcons.length) warn("данные", `иконки уроков повторяются: ${[...new Set(dupIcons)].join(", ")}`);

for (const p of allPhrases) {
  for (const f of ["kk", "ru", "en", "tr", "type"]) {
    if (!p[f]) err("данные", `фраза «${p.kk || "?"}» (урок «${p.lesson}»): не заполнено поле ${f}`);
  }
}

// Два варианта ответа с одинаковым переводом = вопрос без единственного верного ответа.
// Проверяем оба языка интерфейса: дубль в en ломает квиз ровно так же, как в ru.
for (const field of ["ru", "en"]) {
  const byTr = {};
  for (const p of allPhrases) (byTr[p[field]] ||= []).push(p);
  for (const [text, list] of Object.entries(byTr)) {
    const uniqueKk = new Set(list.map((p) => p.kk));
    if (uniqueKk.size > 1) {
      err("данные", `перевод (${field}) «${text}» у разных фраз (${[...uniqueKk].join(" / ")}) — в квизе получится два верных варианта`);
    }
  }
}

// Русский текст в казахском поле: ответ виден прямо в вопросе, а озвучка читает его казахским голосом
for (const p of allPhrases) {
  const kkOnly = p.kk.replace(/[әғқңөұүhіӘҒҚҢӨҰҮҺІ]/g, "");
  if (/[а-яё]/i.test(kkOnly) && /[«»()]/.test(p.kk)) {
    err("данные", `фраза «${p.kk}» (урок «${p.lesson}») содержит русское пояснение в поле kk — перенеси его в ru/en`);
  }
}

// ── Отчёт ────────────────────────────────────────────────────
const group = (list) => {
  const by = {};
  for (const x of list) (by[x.section] ||= []).push(x.msg);
  return by;
};

console.log(`\nАудит интерфейса sitkaz`);
console.log(`Файлов JSX: ${jsxFiles.length} · классов в CSS: ${definedClasses.size} · ключей i18n: ${ruKeys.size} · фраз: ${allPhrases.length}\n`);

if (errors.length) {
  console.log(`ОШИБКИ (${errors.length}) — это ломает интерфейс:`);
  for (const [sec, msgs] of Object.entries(group(errors))) {
    console.log(`\n  [${sec}]`);
    msgs.forEach((m) => console.log(`    ✗ ${m}`));
  }
} else {
  console.log("Ошибок нет.");
}

if (warnings.length) {
  console.log(`\n\nПРЕДУПРЕЖДЕНИЯ (${warnings.length}) — стоит посмотреть:`);
  for (const [sec, msgs] of Object.entries(group(warnings))) {
    console.log(`\n  [${sec}]`);
    msgs.forEach((m) => console.log(`    · ${m}`));
  }
}

console.log("");
process.exit(errors.length ? 1 : 0);
