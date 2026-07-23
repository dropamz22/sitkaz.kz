// ── Геймификация: XP, уровни, достижения ──

import { lessons, lessonsByModule } from "../data/course";
import { dialogs } from "../data/dialogs";
import { learnedCount } from "./srs";

// Очки: верный ответ +10, неверный +2 (за старание),
// сдан урок +50, пройден диалог +30 — начисляются в page.jsx.
export const XP = { correct: 10, wrong: 2, lesson: 50, dialog: 30 };

export const LEVELS = [
  { xp: 0, title: "Бастаушы", ru: "начинающий", en: "beginner" },
  { xp: 150, title: "Үйренуші", ru: "ученик", en: "learner" },
  { xp: 400, title: "Білгір", ru: "знаток", en: "connoisseur" },
  { xp: 900, title: "Сөйлеуші", ru: "говорящий", en: "speaker" },
  { xp: 1800, title: "Шебер", ru: "мастер", en: "master" },
  { xp: 3000, title: "Дана", ru: "мудрец", en: "sage" },
];

export function levelInfo(xp = 0) {
  let li = 0;
  for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].xp) li = k;
  const cur = LEVELS[li];
  const next = LEVELS[li + 1] || null;
  return {
    num: li + 1,
    title: cur.title,
    ru: cur.ru,
    en: cur.en,
    next,
    toNext: next ? next.xp - xp : 0,
    pct: next ? Math.round(((xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100,
  };
}

// Достижения: test(progress) → true, когда заработано.
export const ACHIEVEMENTS = [
  { id: "first_lesson", title: "Алғашқы қадам · первый урок сдан", test: (p) => Object.keys(p.done || {}).length >= 1 },
  { id: "five_lessons", title: "5 уроков позади", test: (p) => Object.keys(p.done || {}).length >= 5 },
  { id: "module_tek", title: "Тема ТЕК завершена", test: (p) => lessonsByModule("tek").every((l) => p.done?.[l.id]) },
  { id: "module_uy", title: "Тема ҮЙ-ІШІ завершена", test: (p) => lessonsByModule("uy").every((l) => p.done?.[l.id]) },
  { id: "module_minez", title: "Тема МІНЕЗ завершена", test: (p) => lessonsByModule("minez").every((l) => p.done?.[l.id]) },
  { id: "course_done", title: "Весь курс пройден", test: (p) => lessons.every((l) => p.done?.[l.id]) },
  { id: "streak3", title: "3 дня подряд", test: (p) => (p.streak?.count || 0) >= 3 },
  { id: "streak7", title: "Неделя без пропусков", test: (p) => (p.streak?.count || 0) >= 7 },
  { id: "streak30", title: "Месяц! Нағыз батыр", test: (p) => (p.streak?.count || 0) >= 30 },
  { id: "learned10", title: "10 фраз выучено", test: (p) => learnedCount(p.srs || {}) >= 10 },
  { id: "learned50", title: "50 фраз выучено", test: (p) => learnedCount(p.srs || {}) >= 50 },
  { id: "perfect_quiz", title: "Мінсіз: квиз 10 из 10", test: (p) => (p.bestScore || 0) >= 10 },
  { id: "all_dialogs", title: "Все диалоги пройдены", test: (p) => dialogs.length > 0 && dialogs.every((d) => p.dialogs?.[d.lessonId]) },
  { id: "xp1000", title: "Высота 1000 метров", test: (p) => (p.xp || 0) >= 1000 },
];
