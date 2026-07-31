"use client";

// ── Знакомство при первом запуске ──
// Три экрана: приветствие с первой фразой → зачем учишь → сколько фраз в день.
// Имя берём из Telegram (initDataUnsafe.user), ничего вводить не нужно.
// Ответы кладём в прогресс: reason влияет на подсказку тем, goal — на цель дня.

import { useState } from "react";
import { MASCOT } from "../data/mascot";
import { speak } from "../lib/audio";
// Первое слово онбординга — в data/irbis.js, чтобы его тоже озвучивал генератор
import { FIRST_PHRASE } from "../data/irbis";
export { FIRST_PHRASE };

// Зачем учат казахский. modules — темы, которые подсветим после знакомства.
export const REASONS = [
  { id: "family", icon: "diversity_1", ru: "Говорить с роднёй", en: "Talk with family", modules: ["uy", "tuys", "tek"] },
  { id: "work", icon: "work", ru: "Для работы", en: "For work", modules: ["jon", "fraze", "attar"] },
  { id: "live", icon: "landscape", ru: "Живу в Казахстане", en: "I live in Kazakhstan", modules: ["jon", "uy", "attar"] },
  { id: "curious", icon: "auto_awesome", ru: "Просто интересно", en: "Just curious", modules: ["makal", "mura", "tek"] },
];

export const GOALS = [
  { value: 5, ru: "Спокойно", en: "Easy", hintRu: "5 фраз в день", hintEn: "5 phrases a day" },
  { value: 10, ru: "Обычно", en: "Regular", hintRu: "10 фраз в день", hintEn: "10 phrases a day" },
  { value: 20, ru: "Серьёзно", en: "Serious", hintRu: "20 фраз в день", hintEn: "20 phrases a day" },
];

const Icon = ({ name, filled, style }) => (
  <span className="msi" style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}>{name}</span>
);

export default function Onboarding({ lang, t, userName, onDone }) {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState(null);
  const [goal, setGoal] = useState(10);

  const hi = userName ? `${t.ob_hi}, ${userName}!` : `${t.ob_hi}!`;

  return (
    <div className="ob">
      <div className="ob-dots">
        {[0, 1, 2].map((n) => <span key={n} className={n <= step ? "on" : ""} />)}
      </div>

      {step === 0 && (
        <div className="ob-card">
          <img className="ob-mascot" src={MASCOT.face} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <h2>{hi}</h2>
          <p>{t.ob_intro}</p>

          <button className="ob-phrase" onClick={() => speak(FIRST_PHRASE.kk)}>
            <span className="ob-phrase-label">{t.ob_first_word}</span>
            <span className="ob-phrase-kk">{FIRST_PHRASE.kk}</span>
            <span className="ob-phrase-ru">
              {lang === "en" ? FIRST_PHRASE.en : FIRST_PHRASE.ru} · [{FIRST_PHRASE.tr}]
              <Icon name="volume_up" style={{ fontSize: 15, marginLeft: 5, verticalAlign: "-0.2em", color: "var(--amber)" }} />
            </span>
          </button>

          <button className="btn primary ob-next" onClick={() => setStep(1)}>{t.ob_start}</button>
        </div>
      )}

      {step === 1 && (
        <div className="ob-card">
          <h2>{t.ob_why}</h2>
          <p>{t.ob_why_sub}</p>
          <div className="ob-options">
            {REASONS.map((r) => (
              <button
                key={r.id}
                className={"ob-option" + (reason === r.id ? " on" : "")}
                onClick={() => setReason(r.id)}
              >
                <Icon name={r.icon} filled />
                {lang === "en" ? r.en : r.ru}
              </button>
            ))}
          </div>
          <button className="btn primary ob-next" disabled={!reason} onClick={() => setStep(2)}>{t.next}</button>
        </div>
      )}

      {step === 2 && (
        <div className="ob-card">
          <h2>{t.ob_goal}</h2>
          <p>{t.ob_goal_sub}</p>
          <div className="ob-goals">
            {GOALS.map((g) => (
              <button
                key={g.value}
                className={"ob-goal" + (goal === g.value ? " on" : "")}
                onClick={() => setGoal(g.value)}
              >
                <span className="ob-goal-n">{g.value}</span>
                <span className="ob-goal-t">{lang === "en" ? g.en : g.ru}</span>
                <span className="ob-goal-h">{lang === "en" ? g.hintEn : g.hintRu}</span>
              </button>
            ))}
          </div>
          <p className="ob-note">{t.ob_goal_note}</p>
          <button className="btn primary ob-next" onClick={() => onDone({ reason, goal })}>{t.ob_finish}</button>
        </div>
      )}
    </div>
  );
}
