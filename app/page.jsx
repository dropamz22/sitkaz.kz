"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { modules, lessons, lessonsByModule, allPhrases } from "../data/course";
import { dialogForLesson } from "../data/dialogs";
import { MASCOT } from "../data/mascot";
import {
  phraseId, shuffle, gradeSrs, dueCount, learnedCount,
  buildDeck, registerActivity, displayStreak, doneToday,
} from "../lib/srs";
import { XP, levelInfo, ACHIEVEMENTS } from "../lib/game";
import { speak } from "../lib/audio";
import { loadLang, saveLang, dict, tr as trBase } from "../lib/i18n";

const STORE_KEY = "sitkaz_progress_v3";
const EMPTY = {
  done: {}, quizzes: 0, bestScore: 0, dialogs: {}, xp: 0, achv: {},
  srs: {}, streak: { count: 0, last: null, todayCount: 0 }, goal: 10,
};

function loadProgress() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const v3 = JSON.parse(localStorage.getItem(STORE_KEY));
    if (v3) return { ...EMPTY, ...v3, streak: { ...EMPTY.streak, ...(v3.streak || {}) } };
    const v2 = JSON.parse(localStorage.getItem("sitkaz_progress_v2"));
    if (v2) return { ...EMPTY, ...v2 };
  } catch {}
  return EMPTY;
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

// ── Язык (контекст) ──
const LangCtx = createContext({ lang: "ru", t: dict("ru"), setLang: () => {} });
const useLang = () => useContext(LangCtx);
// перевод фразы/объекта на текущий язык
const P = (obj, lang) => trBase(obj, lang);
// склонение дней/фраз с учётом языка
const daysWord = (n, t, lang) => lang === "en" ? (n === 1 ? t.day_one : t.day_many) : plural(n, t.day_one, t.day_few, t.day_many);
const phrasesWord = (n, t, lang) => lang === "en" ? (n === 1 ? t.phrase_one : t.phrase_many) : plural(n, t.phrase_one, t.phrase_few, t.phrase_many);

// Иконка Material Symbols
const Icon = ({ name, filled, style }) => (
  <span className="msi" style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}>{name}</span>
);

// Картинка маскота — прячется при сбое загрузки
const Mascot = ({ src, className, alt = "" }) => (
  <img className={className} src={src} alt={alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
);

export default function App() {
  const [tab, setTab] = useState("course");
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [progress, setProgress] = useState(EMPTY);
  const [lang, setLangState] = useState("ru");
  const t = dict(lang);

  useEffect(() => {
    setProgress(loadProgress());
    setLangState(loadLang());
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (tg) { try { tg.ready(); tg.expand(); } catch {} }
  }, []);

  const setLang = (l) => { setLangState(l); saveLang(l); };

  const update = (fn) => {
    setProgress((prev) => {
      const next = fn(prev);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const review = (phrase, known) => {
    update((prev) => ({
      ...prev,
      xp: (prev.xp || 0) + (known ? XP.correct : XP.wrong),
      srs: gradeSrs(prev.srs, phraseId(phrase), known),
      streak: registerActivity(prev.streak),
    }));
  };

  const markDone = (lessonId) => {
    update((prev) =>
      prev.done[lessonId] ? prev
        : { ...prev, done: { ...prev.done, [lessonId]: true }, xp: (prev.xp || 0) + XP.lesson });
  };

  const markDialogDone = (lessonId) => {
    update((prev) =>
      prev.dialogs && prev.dialogs[lessonId] ? prev
        : { ...prev, dialogs: { ...(prev.dialogs || {}), [lessonId]: true }, xp: (prev.xp || 0) + XP.dialog, streak: registerActivity(prev.streak) });
  };

  // ── Тосты + конфетти ──
  const [toasts, setToasts] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const confettiTimer = useRef(null);
  const celebrate = (msg) => {
    const id = Math.random();
    setToasts((tt) => [...tt, { id, msg }]);
    setTimeout(() => setToasts((tt) => tt.filter((x) => x.id !== id)), 3500);
    setConfetti(true);
    if (confettiTimer.current) clearTimeout(confettiTimer.current);
    confettiTimer.current = setTimeout(() => setConfetti(false), 2600);
  };

  const prevRef = useRef(EMPTY);
  const hydratedRef = useRef(false);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = progress;
    const earned = ACHIEVEMENTS.filter((a) => !(progress.achv || {})[a.id] && a.test(progress));
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      if (earned.length) {
        update((p) => ({ ...p, achv: { ...(p.achv || {}), ...Object.fromEntries(earned.map((a) => [a.id, true])) } }));
      }
      return;
    }
    const goal = progress.goal || 10;
    if (doneToday(prev.streak) < goal && doneToday(progress.streak) >= goal) celebrate(t.toast_goal);
    const prevLvl = levelInfo(prev.xp || 0).num;
    const curLvl = levelInfo(progress.xp || 0).num;
    if (curLvl > prevLvl) celebrate(t.toast_level(levelInfo(progress.xp).title));
    if (earned.length) {
      update((p) => ({ ...p, achv: { ...(p.achv || {}), ...Object.fromEntries(earned.map((a) => [a.id, true])) } }));
      earned.forEach((a) => celebrate(t.toast_achv(P(a, lang) || a.ru || a.title)));
    }
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps

  const openLesson = (l) => { setActiveLesson(l); setTab("lesson"); };
  const openModule = (m) => { setActiveModule(m); setTab("module"); };
  const doneCountN = Object.keys(progress.done).length;

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      <div className="app">
        {confetti && <Confetti />}
        <div className="toasts">
          {toasts.map((x) => <div key={x.id} className="toast">{x.msg}</div>)}
        </div>

        <div className="brand">
          <div className="logo">Қ</div>
          <div>
            <h1>sitkaz.kz</h1>
            <span>{t.tagline}</span>
          </div>
          <div className="lang-switch">
            <button className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>RU</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
        </div>

        {tab === "course" && (
          <Course progress={progress} doneCount={doneCountN} onOpenModule={openModule} onOpen={openLesson} goPractice={() => setTab("practice")} />
        )}
        {tab === "module" && activeModule && (
          <ModuleView module={activeModule} progress={progress} onOpen={openLesson} onBack={() => setTab("course")} />
        )}
        {tab === "lesson" && activeLesson && (
          <LessonView
            key={activeLesson.id}
            lesson={activeLesson}
            done={!!progress.done[activeLesson.id]}
            dialogDone={!!(progress.dialogs && progress.dialogs[activeLesson.id])}
            review={review}
            onPassed={() => markDone(activeLesson.id)}
            onDialogComplete={() => markDialogDone(activeLesson.id)}
            onOpen={openLesson}
            onBack={() => setTab("course")}
          />
        )}
        {tab === "practice" && <Practice srs={progress.srs} review={review} />}
        {tab === "quiz" && <Quiz update={update} review={review} />}
        {tab === "stats" && <Stats progress={progress} doneCount={doneCountN} />}

        <nav className="nav">
          {[
            { id: "course", ic: "school", label: t.nav_course },
            { id: "practice", ic: "style", label: t.nav_practice },
            { id: "quiz", ic: "quiz", label: t.nav_quiz },
            { id: "stats", ic: "trending_up", label: t.nav_stats },
          ].map((x) => {
            const active = tab === x.id || (x.id === "course" && (tab === "lesson" || tab === "module"));
            return (
              <button key={x.id} className={active ? "active" : ""} onClick={() => setTab(x.id)}>
                <span className="ic msi" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{x.ic}</span>
                {x.label}
              </button>
            );
          })}
        </nav>
      </div>
    </LangCtx.Provider>
  );
}

// ────────────────────────── Курс ──────────────────────────

function Course({ progress, doneCount, onOpenModule, onOpen, goPractice }) {
  const { lang, t } = useLang();
  const total = lessons.length;
  const pct = Math.round((doneCount / total) * 100);
  const due = dueCount(progress.srs);
  const streak = displayStreak(progress.streak);
  const today = doneToday(progress.streak);
  const goal = progress.goal || 10;
  const nextLesson = lessons.find((l) => !progress.done[l.id]) || null;
  const moduleUnlocked = (idx) => idx === 0 || modules.slice(0, idx).every((pm) =>
    lessonsByModule(pm.id).every((l) => progress.done[l.id]));

  return (
    <>
      <div className="hero">
        <div className="hero-top">
          <div>
            <h2>{t.hero_greeting}</h2>
            <p>{t.hero_sub}</p>
          </div>
          <div className="goal-ring">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="transparent" stroke="#EAF2F9" strokeWidth="6" />
              <circle cx="48" cy="48" r="42" fill="transparent" stroke="#F2953C" strokeWidth="6" strokeLinecap="round"
                strokeDasharray="264" strokeDashoffset={264 - 264 * Math.min(1, today / goal)}
                style={{ transition: "stroke-dashoffset .6s ease" }} />
            </svg>
            <Mascot src={MASCOT.face} alt="Irbis" />
            <div className="goal-ring-label">{t.goal_day}</div>
          </div>
        </div>
        <div className="chips-row">
          <div className="chip"><Icon name="local_fire_department" filled /> <b>{streak}</b> {daysWord(streak, t, lang)}</div>
          <div className="chip"><Icon name="target" /> {t.chip_today} <b>{today}</b>/{goal}</div>
          <div className="chip"><Icon name="autorenew" /> {t.chip_repeat} <b>{due}</b></div>
          <div className="chip"><Icon name="landscape" filled /> <b>{progress.xp || 0}</b> {lang === "en" ? "m" : "м"}</div>
        </div>
        {today >= goal && (
          <p style={{ marginTop: 10 }}><Icon name="celebration" filled style={{ color: "var(--amber)" }} /> {t.goal_done}</p>
        )}
        {nextLesson && (
          <button className="due-btn" onClick={() => onOpen(nextLesson)}>
            <span><Icon name="play_arrow" filled style={{ fontSize: 20, verticalAlign: "-0.25em" }} /> {t.continue}: {P({ ru: "урок", en: "lesson" }, lang)} {nextLesson.id} · {nextLesson.title}</span>
            <span>→</span>
          </button>
        )}
        {due > 0 && (
          <button className="due-btn secondary" onClick={goPractice}>
            <span><Icon name="autorenew" style={{ fontSize: 18, verticalAlign: "-0.2em" }} /> {t.repeat}: {due} {phrasesWord(due, t, lang)}</span>
            <span>→</span>
          </button>
        )}
      </div>

      <div className="section-title">{t.topics}</div>
      <div className="grid">
        {modules.map((m, idx) => {
          const items = lessonsByModule(m.id);
          const mDone = items.filter((l) => progress.done[l.id]).length;
          const unlocked = moduleUnlocked(idx);
          const mPct = Math.round((mDone / items.length) * 100);
          return (
            <div key={m.id} className={"module-card" + (unlocked ? "" : " locked")} onClick={() => unlocked && onOpenModule(m)}>
              <div className="module-num" style={{ background: m.color }}>
                {unlocked ? m.num : <Icon name="lock" style={{ fontSize: 18 }} />}
              </div>
              <div className="module-card-body">
                <h3>{m.title} <span>· {lang === "en" ? m.subtitleEn : m.subtitle}</span></h3>
                <p>{lang === "en" ? m.descEn : m.desc}</p>
                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div style={{ width: `${mPct}%`, background: m.color }} />
                </div>
              </div>
              <div className="module-card-meta">
                <div className="module-count">{mDone}/{items.length}</div>
                <Icon name="chevron_right" style={{ color: "var(--faint)", fontSize: 22 }} />
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 14 }}>
        {t.passed_of(doneCount, total)} ({pct}%)
      </p>
    </>
  );
}

// ────────────────────── Страница темы ──────────────────────

function ModuleView({ module: m, progress, onOpen, onBack }) {
  const { lang, t } = useLang();
  const items = lessonsByModule(m.id);
  const mDone = items.filter((l) => progress.done[l.id]).length;
  const mPct = Math.round((mDone / items.length) * 100);
  return (
    <>
      <button className="back" onClick={onBack}><Icon name="arrow_back" style={{ fontSize: 18 }} /> {t.to_topics}</button>

      <div className="module-hero" style={{ borderColor: m.color }}>
        <div className="module-num" style={{ background: m.color, width: 44, height: 44, fontSize: 17 }}>{m.num}</div>
        <h2>{m.title}</h2>
        <p className="module-hero-sub">{lang === "en" ? m.subtitleEn : m.subtitle}</p>
        <p className="module-hero-desc">{lang === "en" ? m.descEn : m.desc}</p>
        <div className="progress-bar" style={{ marginTop: 14 }}>
          <div style={{ width: `${mPct}%`, background: m.color }} />
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>{t.passed_of(mDone, items.length)}</p>
      </div>

      <div className="section-title">{t.lessons}</div>
      <div className="grid">
        {items.map((l) => {
          const unlocked = l.id === 1 || progress.done[l.id] || progress.done[l.id - 1];
          return (
            <div key={l.id} className={"card" + (unlocked ? "" : " locked")} onClick={() => unlocked && onOpen(l)}>
              <div className="lesson-row">
                <div className="lesson-icon" style={{ color: m.color }}>
                  {progress.done[l.id] ? <Icon name="check_circle" filled /> : unlocked ? l.id : <Icon name="lock" />}
                </div>
                <div className="lesson-meta">
                  <h3>{l.title}</h3>
                  <p>{lang === "en" ? l.en : l.ru}</p>
                </div>
                <div className="lesson-count">
                  {unlocked ? t.phrases_count(l.phrases.length) : t.lesson_locked}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ────────────────────────── Урок ──────────────────────────

function StepBar({ stage }) {
  const { t } = useLang();
  const steps = [
    { id: "study", label: t.step_study },
    { id: "practice", label: t.step_practice },
    { id: "quiz", label: t.step_quiz },
  ];
  const order = { study: 0, practice: 1, quiz: 2 };
  const cur = order[stage] ?? 0;
  return (
    <div className="stepbar">
      {steps.map((s, idx) => (
        <div key={s.id} className={"step" + (idx === cur ? " active" : idx < cur ? " done" : "")}>
          <div className="step-dot">{idx < cur ? "✓" : idx + 1}</div>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function LessonView({ lesson, done, dialogDone, review, onPassed, onDialogComplete, onOpen, onBack }) {
  const { lang } = useLang();
  const mod = modules.find((m) => m.id === lesson.module);
  const dialog = dialogForLesson(lesson.id);
  const nextLesson = lessons.find((l) => l.id === lesson.id + 1) || null;
  const [stage, setStage] = useState("study");

  const header = (
    <>
      <div className="lesson-topbar">
        <button className="back" style={{ margin: 0 }} onClick={onBack}><Icon name="close" style={{ fontSize: 18 }} /></button>
        <div className="lesson-topbar-title">
          <b>{lesson.title}</b>
          <span>{lang === "en" ? lesson.en : lesson.ru}</span>
        </div>
      </div>
      <StepBar stage={stage === "dialog" ? "study" : stage} />
    </>
  );

  if (stage === "dialog" && dialog) {
    return <DialogView dialog={dialog} onBack={() => setStage("study")} onComplete={onDialogComplete} />;
  }
  if (stage === "study") {
    return (<>{header}<StudyTrainer lesson={lesson} onDone={() => setStage("practice")} /></>);
  }
  if (stage === "practice") {
    return (<>{header}<LessonPractice lesson={lesson} review={review} onDone={() => setStage("quiz")} /></>);
  }
  return (
    <>
      {header}
      <LessonQuiz lesson={lesson} review={review} onPassed={onPassed} onBack={() => setStage("practice")}
        nextLesson={nextLesson} onOpen={onOpen} dialog={dialog} dialogDone={dialogDone} onDialog={() => setStage("dialog")} />
    </>
  );
}

// ─────────── Этап 1: Изучение ───────────

const typeLabel = (type, t) => ({
  term: t.type_term, proverb: t.type_proverb, colloc: t.type_colloc, phrase: t.type_phrase,
}[type || "phrase"]);

function StudyTrainer({ lesson, onDone }) {
  const { lang, t } = useLang();
  const [showNote, setShowNote] = useState(!!lesson.note);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const totalN = lesson.phrases.length;
  const p = lesson.phrases[i];

  useEffect(() => { if (!showNote) speak(p.kk); }, [i, showNote]); // eslint-disable-line react-hooks/exhaustive-deps

  // Экран культурной заметки перед фразами
  if (showNote && lesson.note) {
    return (
      <div className="note-screen">
        <Mascot className="mascot-big" src={MASCOT.face} alt="Irbis" />
        <div className="note-title">{t.note_title}</div>
        <div className="note-card">{lang === "en" ? lesson.note.en : lesson.note.ru}</div>
        <button className="btn primary" style={{ width: "100%", maxWidth: 320 }} onClick={() => setShowNote(false)}>
          {t.note_start}
        </button>
      </div>
    );
  }

  const next = () => {
    if (i + 1 >= totalN) { onDone(); return; }
    setI(i + 1); setRevealed(false);
  };

  return (
    <>
      <div className="lesson-progress">
        <div className="lesson-progress-bar"><div style={{ width: `${((i + 1) / totalN) * 100}%` }} /></div>
        <span>{i + 1} / {totalN}</span>
      </div>

      <div className={"study-card" + (p.type && p.type !== "phrase" ? " study-" + p.type : "")} onClick={() => speak(p.kk)}>
        <div className={"type-badge type-" + (p.type || "phrase")}>{typeLabel(p.type, t)}</div>
        <div className="study-kk">{p.kk}</div>
        <div className="study-tr">[{p.tr}] <Icon name="volume_up" style={{ fontSize: 16 }} /></div>
        {revealed ? (
          <div className="study-ru">{P(p, lang)}</div>
        ) : (
          <button className="study-reveal" onClick={(e) => { e.stopPropagation(); setRevealed(true); }}>{t.show_translation}</button>
        )}
      </div>

      <button className="btn primary" style={{ width: "100%", marginTop: 6 }} onClick={next}>
        {i + 1 >= totalN ? t.to_practice : t.next}
      </button>
    </>
  );
}

// ─────────── Этап 2: Практика ───────────

function makePracticeQ(p, lesson) {
  const w = { ...p, lesson: lesson.title, lessonId: lesson.id };
  const words = w.kk.split(/\s+/).filter(Boolean);
  const types = ["kk2ru", "ru2kk", "listen"];
  if (words.length >= 3 && words.length <= 8) types.push("assemble");
  const type = types[Math.floor(Math.random() * types.length)];
  if (type === "assemble") return { type, word: w, words: shuffle(words) };
  const wrong = shuffle(allPhrases.filter((x) => x.kk !== w.kk)).slice(0, 3);
  return { type, word: w, options: shuffle([w, ...wrong]) };
}

function LessonPractice({ lesson, review, onDone }) {
  const { t } = useLang();
  const [queue, setQueue] = useState(() => shuffle(lesson.phrases).map((p) => makePracticeQ(p, lesson)));
  const [i, setI] = useState(0);
  const totalN = lesson.phrases.length;
  const q = queue[i];

  const answered = (ok) => {
    review(q.word, ok);
    if (!ok) setQueue((prev) => [...prev, makePracticeQ(q.word, lesson)]);
    if (i + 1 >= queue.length) { onDone(); return; }
    setI(i + 1);
  };

  return (
    <>
      <div className="lesson-progress">
        <div className="lesson-progress-bar"><div style={{ width: `${Math.min(100, ((i + 1) / totalN) * 100)}%` }} /></div>
        <span>{Math.min(i + 1, totalN)} / {totalN}</span>
      </div>
      <div className="q-type">{qLabel(q.type, t)}</div>
      {q.type === "assemble" ? <AssembleQ key={i} q={q} onAnswer={answered} /> : <ChoiceQ key={i} q={q} onAnswer={answered} />}
    </>
  );
}

// ─────────── Мини-экзамен урока ───────────

function makeLessonQuestions(lesson) {
  const pool = shuffle(lesson.phrases).slice(0, 5);
  return pool.map((p) => {
    const w = { ...p, lesson: lesson.title, lessonId: lesson.id };
    const words = w.kk.split(/\s+/).filter(Boolean);
    const types = ["kk2ru", "ru2kk"];
    if (words.length >= 3 && words.length <= 8) types.push("assemble");
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === "assemble") return { type, word: w, words: shuffle(words) };
    const wrong = shuffle(allPhrases.filter((x) => x.kk !== w.kk)).slice(0, 3);
    return { type, word: w, options: shuffle([w, ...wrong]) };
  });
}

function LessonQuiz({ lesson, review, onPassed, onBack, nextLesson, onOpen, dialog, dialogDone, onDialog }) {
  const { lang, t } = useLang();
  const [questions, setQuestions] = useState(() => makeLessonQuestions(lesson));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const need = Math.max(1, Math.ceil(questions.length * 0.8));
  const q = questions[i];

  const answered = (ok) => {
    review(q.word, ok);
    const s = ok ? score + 1 : score;
    setScore(s);
    if (i + 1 >= questions.length) { if (s >= need) onPassed(); setDone(true); }
    else setI(i + 1);
  };

  const restart = () => { setQuestions(makeLessonQuestions(lesson)); setI(0); setScore(0); setDone(false); };

  if (done) {
    const passed = score >= need;
    return (
      <div className="result">
        {passed && <Mascot className="mascot-big" src={MASCOT.leap} alt="Irbis" />}
        <div className="score">{score} / {questions.length}</div>
        {passed ? (
          <>
            <p>{lang === "en"
              ? `Керемет! Lesson "${lesson.en}" passed! +50 m of altitude.${nextLesson ? " The next camp is open." : " That was the summit of the course!"}`
              : `Керемет! Урок «${lesson.ru}» сдан! +50 м высоты.${nextLesson ? " Следующий лагерь открыт." : " Это была вершина курса!"}`}</p>
            {dialog && !dialogDone && (
              <button className="btn ghost" style={{ width: "100%", marginBottom: 10 }} onClick={onDialog}>
                <Icon name="forum" /> {t.pass_dialog}
              </button>
            )}
            {nextLesson ? (
              <button className="btn primary" style={{ width: "100%" }} onClick={() => onOpen(nextLesson)}>
                {lang === "en" ? "Lesson" : "Урок"} {nextLesson.id}: {nextLesson.title} →
              </button>
            ) : (
              <button className="btn primary" style={{ width: "100%" }} onClick={onBack}>{t.to_topics}</button>
            )}
          </>
        ) : (
          <>
            <p>{t.exam_fail(need, questions.length)}</p>
            <div className="flash-controls">
              <button className="btn ghost" onClick={onBack}>{t.to_phrases}</button>
              <button className="btn primary" onClick={restart}>{t.once_more}</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="quiz-progress">{t.exam} · {t.question.toLowerCase()} {i + 1} {t.of} {questions.length} · {t.correct}: {score}</div>
      <div className="q-type">{qLabel(q.type, t)}</div>
      {q.type === "assemble" ? <AssembleQ key={i} q={q} onAnswer={answered} /> : <ChoiceQ key={i} q={q} onAnswer={answered} />}
    </>
  );
}

// ─────────────── Диалог-сценка ───────────────

function DialogView({ dialog, onBack, onComplete }) {
  const { lang, t } = useLang();
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [wrongIdx, setWrongIdx] = useState(null);
  const finished = step >= dialog.steps.length;
  const title = lang === "en" ? dialog.titleEn : dialog.title;

  useEffect(() => { if (finished) onComplete(); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (opt, idx) => {
    if (opt.ok) { speak(opt.kk); setHistory((h) => [...h, opt]); setWrongIdx(null); setStep((s) => s + 1); }
    else setWrongIdx(idx);
  };

  const current = finished ? null : dialog.steps[step];

  return (
    <>
      <button className="back" onClick={onBack}><Icon name="arrow_back" style={{ fontSize: 18 }} /> {t.back_to_lesson}</button>
      <div className="section-title">{t.dialog} · {title}</div>
      {step === 0 && !finished && <p className="dialog-intro">{lang === "en" ? dialog.introEn : dialog.intro}</p>}

      <div className="chat">
        {dialog.steps.slice(0, step).map((s, si) => (
          <div key={si} style={{ display: "contents" }}>
            <div className="bubble-row">
              <Mascot className="bubble-avatar" src={MASCOT.face} />
              <div className="bubble bot" onClick={() => speak(s.bot.kk)}>
                {s.bot.kk}
                <div className="ru-sub">{P(s.bot, lang)}</div>
              </div>
            </div>
            {history[si] && (
              <div className="bubble-row me">
                <div className="bubble me" onClick={() => speak(history[si].kk)}>
                  {history[si].kk}
                  <div className="ru-sub">{P(history[si], lang)}</div>
                </div>
              </div>
            )}
          </div>
        ))}
        {current && (
          <div className="bubble-row">
            <Mascot className="bubble-avatar" src={MASCOT.face} />
            <div className="bubble bot" onClick={() => speak(current.bot.kk)}>
              {current.bot.kk}
              <div className="ru-sub">{P(current.bot, lang)}</div>
            </div>
          </div>
        )}
      </div>

      {finished ? (
        <div className="practice-done" style={{ padding: "10px" }}>
          <Mascot className="mascot-big" src={MASCOT.campfire} alt="Irbis" />
          <h2 style={{ margin: "10px 0 6px" }}>{t.dialog_done}</h2>
          <p style={{ color: "var(--muted)", marginBottom: 18 }}>{t.dialog_done_sub(title)}</p>
          <button className="btn primary" style={{ maxWidth: 260 }} onClick={onBack}>{t.back_to_lesson}</button>
        </div>
      ) : (
        <>
          <div className="section-title" style={{ marginTop: 6 }}>{t.your_answer}</div>
          {current.options.map((opt, idx) => (
            <button key={idx} className={"quiz-opt" + (wrongIdx === idx ? " wrong" : "")} onClick={() => pick(opt, idx)}>
              {opt.kk}
              <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 3 }}>{P(opt, lang)}</div>
            </button>
          ))}
          {wrongIdx !== null && (
            <p style={{ textAlign: "center", color: "var(--bad)", fontSize: 13 }}>{t.dialog_wrong}</p>
          )}
        </>
      )}
    </>
  );
}

// ─────────────────── Практика (SRS) ───────────────────

function Practice({ srs, review }) {
  const { lang, t } = useLang();
  const [deck, setDeck] = useState(() => buildDeck(srs, allPhrases));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({ known: 0, unknown: 0 });

  const restart = () => { setDeck(buildDeck(srs, allPhrases)); setI(0); setFlipped(false); setSession({ known: 0, unknown: 0 }); };

  if (!deck.cards.length) {
    return (
      <div className="practice-done">
        <Mascot className="mascot-sleep" src={MASCOT.sleep} alt="Irbis" />
        <h2 style={{ margin: "10px 0 6px" }}>{t.all_done_today}</h2>
        <p style={{ color: "var(--muted)" }}>{t.all_reviewed}</p>
      </div>
    );
  }

  if (i >= deck.cards.length) {
    const totalN = session.known + session.unknown;
    return (
      <div className="practice-done">
        <Mascot className="mascot-sleep" src={MASCOT.sleep} alt="Irbis" />
        <h2 style={{ margin: "10px 0 6px" }}>{t.session_done}</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>
          {lang === "en"
            ? `${totalN} ${phrasesWord(totalN, t, lang)}: knew ${session.known}, ${session.unknown} to review again`
            : `${totalN} ${phrasesWord(totalN, t, lang)}: знал ${session.known}, повторим ещё ${session.unknown}`}
        </p>
        <button className="btn primary" style={{ maxWidth: 260 }} onClick={restart}>{t.continue_practice}</button>
      </div>
    );
  }

  const card = deck.cards[i];
  const grade = (known) => {
    review(card, known);
    setSession((s) => (known ? { ...s, known: s.known + 1 } : { ...s, unknown: s.unknown + 1 }));
    setFlipped(false);
    setI((v) => v + 1);
  };

  return (
    <>
      <div className="section-title">
        {t.card} {i + 1} / {deck.cards.length}
        {deck.free ? ` · ${t.free_practice}` : ` · ${t.reviewing}: ${deck.due} · ${t.new_cards}: ${deck.fresh}`}
      </div>
      <div className="flash-wrap">
        <Mascot className="mascot-peek" src={MASCOT.peek} />
        <div className="flash" onClick={() => { setFlipped((f) => !f); if (!flipped) speak(card.kk); }}>
          {!flipped ? (
            <div>
              <div className="big">{card.kk}</div>
              <div className="sub">[{card.tr}] <Icon name="volume_up" style={{ fontSize: 15 }} /></div>
              <div className="hint">{t.show_translation}</div>
            </div>
          ) : (
            <div>
              <div className="big" style={{ fontSize: 24 }}>{P(card, lang)}</div>
              <div className="hint">{card.lesson}</div>
            </div>
          )}
        </div>
        <div className="flash-controls">
          <button className="btn bad" onClick={() => grade(false)}>{t.dont_know}</button>
          <button className="btn good" onClick={() => grade(true)}>{t.know}</button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center" }}>{t.srs_hint}</p>
      </div>
    </>
  );
}

// ────────────────────────── Квиз ──────────────────────────

function qLabel(type, t) {
  return { kk2ru: t.q_type_kk2ru, ru2kk: t.q_type_ru2kk, listen: t.q_type_listen, assemble: t.q_type_assemble }[type];
}

function makeQuestions() {
  const pool = shuffle(allPhrases).slice(0, 10);
  return pool.map((w) => {
    const words = w.kk.split(/\s+/).filter(Boolean);
    const types = ["kk2ru", "ru2kk", "listen"];
    if (words.length >= 3 && words.length <= 8) types.push("assemble", "assemble");
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === "assemble") return { type, word: w, words: shuffle(words) };
    const wrong = shuffle(allPhrases.filter((x) => x.kk !== w.kk)).slice(0, 3);
    return { type, word: w, options: shuffle([w, ...wrong]) };
  });
}

function Quiz({ update, review }) {
  const { t } = useLang();
  const [questions, setQuestions] = useState(makeQuestions);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[i];

  const answered = (ok) => {
    review(q.word, ok);
    const s = ok ? score + 1 : score;
    setScore(s);
    if (i + 1 >= questions.length) {
      update((prev) => ({ ...prev, quizzes: (prev.quizzes || 0) + 1, bestScore: Math.max(prev.bestScore || 0, s) }));
      setDone(true);
    } else setI(i + 1);
  };

  const restart = () => { setQuestions(makeQuestions()); setI(0); setScore(0); setDone(false); };

  if (done) {
    return (
      <div className="result">
        <div className="section-title">{t.result}</div>
        <div className="score">{score} / {questions.length}</div>
        <p>{score >= 8 ? t.quiz_great : score >= 5 ? t.quiz_good : t.quiz_retry}</p>
        <button className="btn primary" onClick={restart}>{t.quiz_again}</button>
      </div>
    );
  }

  return (
    <>
      <div className="quiz-progress">{t.question} {i + 1} {t.of} {questions.length} · {t.points}: {score}</div>
      <div className="q-type">{qLabel(q.type, t)}</div>
      {q.type === "assemble" ? <AssembleQ key={i} q={q} onAnswer={answered} /> : <ChoiceQ key={i} q={q} onAnswer={answered} />}
    </>
  );
}

function ChoiceQ({ q, onAnswer }) {
  const { lang, t } = useLang();
  const [picked, setPicked] = useState(null);

  useEffect(() => { if (q.type === "listen") speak(q.word.kk); }, [q]);

  const isCorrect = (o) => o.kk === q.word.kk;

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    const ok = isCorrect(opt);
    if (q.type === "ru2kk" && ok) speak(q.word.kk);
    setTimeout(() => onAnswer(ok), 900);
  };

  return (
    <>
      {q.type === "kk2ru" && (
        <>
          <div className="quiz-q" onClick={() => speak(q.word.kk)}>
            {q.word.kk} <Icon name="volume_up" style={{ fontSize: 20, color: "var(--amber)" }} />
          </div>
          <div className="quiz-sub">[{q.word.tr}]</div>
        </>
      )}
      {q.type === "ru2kk" && <div className="quiz-q" style={{ fontSize: 22 }}>{P(q.word, lang)}</div>}
      {q.type === "listen" && (
        <>
          <button className="listen-btn" onClick={() => speak(q.word.kk)}>
            <Mascot src={MASCOT.headphones} alt="Irbis" />
            <span className="vol-badge"><Icon name="volume_up" filled /></span>
          </button>
          <div className="quiz-sub">{t.listen_again}</div>
        </>
      )}

      {q.options.map((opt) => {
        let cls = "quiz-opt";
        if (picked) {
          if (isCorrect(opt)) cls += " correct";
          else if (opt === picked) cls += " wrong";
        }
        return (
          <button key={opt.kk} className={cls} onClick={() => pick(opt)}>
            {q.type === "ru2kk" ? opt.kk : P(opt, lang)}
          </button>
        );
      })}
      {picked && q.type === "listen" && (
        <p style={{ textAlign: "center", color: "var(--accent)", fontStyle: "italic" }}>{q.word.kk} · [{q.word.tr}]</p>
      )}
    </>
  );
}

function AssembleQ({ q, onAnswer }) {
  const { lang, t } = useLang();
  const [picked, setPicked] = useState([]);
  const [state, setState] = useState(null);
  const target = q.word.kk.split(/\s+/).filter(Boolean).join(" ");

  const pickWord = (idx) => {
    if (state || picked.includes(idx)) return;
    const next = [...picked, idx];
    setPicked(next);
    if (next.length === q.words.length) {
      const answer = next.map((j) => q.words[j]).join(" ");
      const ok = answer === target;
      setState(ok ? "ok" : "bad");
      if (ok) speak(q.word.kk);
      setTimeout(() => onAnswer(ok), ok ? 1200 : 2000);
    }
  };

  const unpick = (pos) => { if (!state) setPicked(picked.filter((_, j) => j !== pos)); };

  return (
    <>
      <div className="quiz-q" style={{ fontSize: 20 }}>{P(q.word, lang)}</div>
      <div className={"assemble-line" + (state === "ok" ? " assemble-ok" : state === "bad" ? " assemble-bad" : "")}>
        {picked.map((idx, pos) => (
          <button key={idx} className="word-chip" onClick={() => unpick(pos)}>{q.words[idx]}</button>
        ))}
        {!picked.length && <span style={{ color: "var(--muted)", fontSize: 14, alignSelf: "center" }}>{t.assemble_hint}</span>}
      </div>
      <div className="word-bank">
        {q.words.map((w, idx) => (
          <button key={idx} className="word-chip" disabled={picked.includes(idx)} onClick={() => pickWord(idx)}>{w}</button>
        ))}
      </div>
      {state === "bad" && (
        <p style={{ textAlign: "center", color: "var(--bad)" }}>{t.assemble_wrong(q.word.kk)}</p>
      )}
      {state === "ok" && <p style={{ textAlign: "center", color: "var(--good)" }}>{t.assemble_ok}</p>}
    </>
  );
}

// ────────────────────────── Прогресс ──────────────────────────

function Stats({ progress, doneCount }) {
  const { lang, t } = useLang();
  const total = lessons.length;
  const pct = Math.round((doneCount / total) * 100);
  const streak = displayStreak(progress.streak);
  const today = doneToday(progress.streak);
  const goal = progress.goal || 10;
  const due = dueCount(progress.srs);
  const learned = learnedCount(progress.srs);
  const inWork = Object.keys(progress.srs).length;
  const lv = levelInfo(progress.xp || 0);
  const unit = lang === "en" ? "m" : "м";

  return (
    <>
      <div className="section-title">{t.your_progress}</div>

      <div className="level-card">
        <div className="level-ring">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="58" fill="transparent" stroke="#D9EAFF" strokeWidth="6" />
            <circle cx="64" cy="64" r="58" fill="transparent" stroke="#F2953C" strokeWidth="6" strokeLinecap="round"
              strokeDasharray="364" strokeDashoffset={364 - 364 * (lv.pct / 100)} style={{ transition: "stroke-dashoffset .8s ease" }} />
          </svg>
          <Mascot src={MASCOT.portrait} alt="Irbis" />
          <div className="lvl-badge">{lang === "en" ? "LVL" : "УР."} {lv.num}</div>
        </div>
        <h2>{lv.title} · {lang === "en" ? lv.en : lv.ru}</h2>
        <p>
          {t.altitude(progress.xp || 0)}
          {lv.next ? <> — {t.to_rank(lv.next.title, lv.toNext)}</> : ` — ${t.summit_reached}`}
        </p>
      </div>

      <div className="stat-row" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="num"><Icon name="local_fire_department" filled style={{ fontSize: 20, color: "var(--amber)" }} /> {streak}</div><div className="lbl">{daysWord(streak, t, lang)} {t.st_days}</div></div>
        <div className="stat"><div className="num">{today}/{goal}</div><div className="lbl">{t.st_today}</div></div>
      </div>
      <div className="stat-row" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="num">{learned}</div><div className="lbl">{t.st_learned}</div></div>
        <div className="stat"><div className="num">{inWork}</div><div className="lbl">{t.st_inwork}</div></div>
        <div className="stat"><div className="num">{due}</div><div className="lbl">{t.st_review}</div></div>
      </div>
      <div className="stat-row" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="num">{doneCount}</div><div className="lbl">{t.st_lessons}</div></div>
        <div className="stat"><div className="num">{pct}%</div><div className="lbl">{t.st_course}</div></div>
      </div>
      <div className="stat-row">
        <div className="stat"><div className="num">{progress.quizzes || 0}</div><div className="lbl">{t.st_quizzes}</div></div>
        <div className="stat"><div className="num">{progress.bestScore || 0}/10</div><div className="lbl">{t.st_best}</div></div>
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>{t.achievements} · {Object.keys(progress.achv || {}).length}/{ACHIEVEMENTS.length}</div>
      <div className="achv-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = !!(progress.achv && progress.achv[a.id]);
          return (
            <div key={a.id} className={"achv" + (got ? " got" : "")}>
              <div className="achv-ic">
                <Icon name={got ? "emoji_events" : "lock"} filled={got} style={got ? { color: "var(--amber)" } : undefined} />
              </div>
              <div className="achv-t">{lang === "en" && a.en ? a.en : a.title}</div>
            </div>
          );
        })}
      </div>

      <div className="hero" style={{ marginTop: 16 }}>
        <h2>{t.keep_going}</h2>
        <p>{t.keep_going_sub}</p>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
      </div>
    </>
  );
}

// ────────────────────────── Конфетти ──────────────────────────

const CONFETTI_COLORS = ["#F2953C", "#D6E6F2", "#BFDCF0", "#ffffff", "#b7c9d9", "#ffb77b"];

function Confetti() {
  return (
    <div className="confetti">
      {Array.from({ length: 44 }, (_, i) => (
        <span key={i} style={{
          left: `${Math.random() * 100}%`,
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          animationDelay: `${Math.random() * 0.6}s`,
          animationDuration: `${1.7 + Math.random() * 1.3}s`,
        }} />
      ))}
    </div>
  );
}
