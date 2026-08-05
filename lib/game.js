// ── Геймификация: XP, уровни, достижения ──

import { modules, lessons, lessonsByModule } from "../data/course";
import { dialogs } from "../data/dialogs";
import { learnedCount, dueCount, doneToday, todayStr } from "./srs";

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

// По достижению за каждую завершённую тему — генерируем из списка модулей,
// чтобы все 6 тем были покрыты одинаково (раньше их было только три).
const moduleAchievements = modules.map((m) => ({
  id: `module_${m.id}`,
  title: `Тема ${m.title} завершена`,
  en: `Topic ${m.title} complete`,
  test: (p) => lessonsByModule(m.id).every((l) => p.done?.[l.id]),
}));

// Достижения: test(progress) → true, когда заработано.
export const ACHIEVEMENTS = [
  { id: "first_lesson", title: "Алғашқы қадам · первый урок сдан", en: "First step · first lesson passed", test: (p) => Object.keys(p.done || {}).length >= 1 },
  { id: "five_lessons", title: "5 уроков позади", en: "5 lessons done", test: (p) => Object.keys(p.done || {}).length >= 5 },
  ...moduleAchievements,
  { id: "course_done", title: "Весь курс пройден", en: "Whole course complete", test: (p) => lessons.every((l) => p.done?.[l.id]) },
  { id: "streak3", title: "3 дня подряд", en: "3-day streak", test: (p) => (p.streak?.count || 0) >= 3 },
  { id: "streak7", title: "Неделя без пропусков", en: "A full week, no gaps", test: (p) => (p.streak?.count || 0) >= 7 },
  { id: "streak30", title: "Месяц! Нағыз батыр", en: "A month! Nağyz batyr", test: (p) => (p.streak?.count || 0) >= 30 },
  { id: "learned10", title: "10 фраз выучено", en: "10 phrases learned", test: (p) => learnedCount(p.srs || {}) >= 10 },
  { id: "learned50", title: "50 фраз выучено", en: "50 phrases learned", test: (p) => learnedCount(p.srs || {}) >= 50 },
  { id: "perfect_quiz", title: "Мінсіз: квиз 10 из 10", en: "Flawless: quiz 10/10", test: (p) => (p.bestScore || 0) >= 10 },
  { id: "all_dialogs", title: "Все диалоги пройдены", en: "All dialogues complete", test: (p) => dialogs.length > 0 && dialogs.every((d) => p.dialogs?.[d.lessonId]) },
  { id: "xp1000", title: "Высота 1000 метров", en: "1000 meters high", test: (p) => (p.xp || 0) >= 1000 },
];

// ── Настроение Ирбиса: какая поза уместна прямо сейчас ──
// Возвращает ключ позы из MASCOT по состоянию прогресса. Так маскот
// «реагирует» на пользователя, а не стоит в одной позе.
//   leap       — цель дня взята
//   sleep      — давно не заходил / весь курс пройден
//   peek       — серия под угрозой (был вчера, сегодня ноль)
//   headphones — есть что повторить
//   face       — обычное состояние / новичок
export function moodPose(progress = {}) {
  const p = progress;
  const goal = p.goal || 10;
  const today = doneToday(p.streak);
  const due = dueCount(p.srs || {});
  const last = p.streak && p.streak.last;
  const t = todayStr();
  const yesterday = todayStr(new Date(Date.now() - 86400000));
  const activeToday = last === t;
  const activeYesterday = last === yesterday;

  if (today >= goal && today > 0) return "leap";
  if (last) {
    if (!activeToday && !activeYesterday) return "sleep";   // пропал на день+
    if (activeYesterday && today === 0) return "peek";      // серия под угрозой
  }
  if (due > 0) return "headphones";
  if (lessons.length && lessons.every((l) => p.done?.[l.id])) return "sleep"; // всё пройдено
  return "face";
}
