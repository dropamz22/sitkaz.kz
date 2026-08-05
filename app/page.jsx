"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { modules, lessons, lessonsByModule, allPhrases, openPhrases } from "../data/course";
import { dialogForLesson } from "../data/dialogs";
import { MASCOT } from "../data/mascot";
import { IRBIS_CHEERS } from "../data/irbis";
import { TESTS } from "../data/tests";
import {
  phraseId, shuffle, gradeSrs, dueCount, learnedCount,
  buildDeck, registerActivity, displayStreak, doneToday, freezeStatus, bumpDay,
} from "../lib/srs";
import { XP, levelInfo, ACHIEVEMENTS } from "../lib/game";
import { speak, loadVoice, setVoice as saveVoice } from "../lib/audio";
import { loadLang, saveLang, dict, tr as trBase } from "../lib/i18n";
import Onboarding, { REASONS } from "./onboarding";
import {
  loadProgress as loadStored, saveProgress as saveStored,
  flushProgress, mergeProgress, cloudAvailable, loadLocalFast,
} from "../lib/storage";

const EMPTY = {
  done: {}, quizzes: 0, bestScore: 0, dialogs: {}, xp: 0, achv: {},
  srs: {}, streak: { count: 0, last: null, todayCount: 0, freeze: null }, goal: 10, days: {},
  onboarded: false, reason: null, exams: {},
};

// Старый формат прогресса — переносим, чтобы никто ничего не потерял
function legacyProgress() {
  if (typeof window === "undefined") return null;
  try {
    const v2 = JSON.parse(localStorage.getItem("sitkaz_progress_v2"));
    if (v2) return { ...EMPTY, ...v2 };
  } catch {}
  return null;
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
const Icon = ({ name, filled, style, className }) => (
  <span className={"msi" + (className ? ` ${className}` : "")} style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}>{name}</span>
);

// Картинка маскота — прячется при сбое загрузки
const Mascot = ({ src, className, alt = "" }) => (
  <img className={className} src={src} alt={alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
);

// Делает кликабельный <div> доступным с клавиатуры: фокус + Enter/Space.
// Если enabled=false (напр. заблокированный урок) — элемент не интерактивен.
const clickable = (handler, enabled = true) => enabled ? {
  role: "button",
  tabIndex: 0,
  onClick: handler,
  onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(); } },
} : {};

export default function App() {
  const [tab, setTab] = useState("course");
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [progress, setProgress] = useState(EMPTY);
  const [lang, setLangState] = useState("ru");
  const [voice, setVoiceState] = useState("aigul");
  const [tgUser, setTgUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const progressRef = useRef(EMPTY); // актуальный прогресс для записи при закрытии
  const t = dict(lang);

  useEffect(() => {
    let cancelled = false;
    let lng = loadLang();
    setVoiceState(loadVoice());
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        // Полноэкранный режим (Telegram 8.0+): приложение занимает весь экран,
        // не сворачивается свайпом вниз. На старых версиях методов нет — молча пропускаем.
        tg.disableVerticalSwipes?.();
        tg.requestFullscreen?.();
        // Под системную панель Telegram оставляем отступ сверху, чтобы шапку не срезало
        const applyTopInset = () => {
          const top = (tg.contentSafeAreaInset?.top || 0) + (tg.safeAreaInset?.top || 0);
          document.documentElement.style.setProperty("--tg-top", `${top}px`);
        };
        applyTopInset();
        tg.onEvent?.("fullscreenChanged", applyTopInset);
        tg.onEvent?.("safeAreaChanged", applyTopInset);
        tg.onEvent?.("contentSafeAreaChanged", applyTopInset);
      } catch {}
      const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
      if (u) setTgUser(u);
    }

    // Приводим прогресс к полной форме и решаем судьбу экрана знакомства
    const shape = (p) => {
      const final = { ...EMPTY, ...p, streak: { ...EMPTY.streak, ...(p.streak || {}) } };
      // Кто уже учится — знакомство не показываем: отметки о нём нет только
      // потому, что человек начал заниматься до появления этого экрана.
      if (!final.onboarded && (Object.keys(final.done).length || Object.keys(final.srs).length || final.xp)) {
        final.onboarded = true;
      }
      return final;
    };

    // 1) Мгновенный старт: рисуем интерфейс сразу из локального прогресса,
    //    не дожидаясь сети. Возвращающийся пользователь видит всё без заминки.
    const localMerged = mergeProgress(loadLocalFast(EMPTY), legacyProgress());
    const firstUser = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    // Язык интерфейса берём из Telegram, но только при самом первом запуске —
    // выбор пользователя в переключателе всегда важнее.
    if (firstUser && !(localMerged && localMerged.onboarded)
        && !localStorage.getItem("sitkaz_lang") && firstUser.language_code) {
      lng = firstUser.language_code.startsWith("en") ? "en" : "ru";
    }
    const localFinal = shape(localMerged || EMPTY);
    progressRef.current = localFinal;
    setProgress(localFinal);
    setLangState(lng);
    setHydrated(true);

    // 2) В фоне подтягиваем облако Telegram / сервер и мягко доливаем —
    //    не теряя то, что человек успел наиграть за это время.
    (async () => {
      const { progress: loaded } = await loadStored(EMPTY);
      if (cancelled) return;
      const merged = mergeProgress(mergeProgress(loaded, legacyProgress()), progressRef.current);
      const final = shape(merged);
      if (JSON.stringify(final) !== JSON.stringify(progressRef.current)) {
        progressRef.current = final;
        setProgress(final);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Приложение закрывают — дописываем прогресс в облако, не дожидаясь таймера
  useEffect(() => {
    const flush = () => flushProgress(progressRef.current);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  // Service worker: офлайн-кэш озвучки и картинок (быстрее и работает без сети)
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const setLang = (l) => { setLangState(l); saveLang(l); };
  const changeVoice = (v) => { saveVoice(v); setVoiceState(v); };

  const update = (fn) => {
    setProgress((prev) => {
      const next = fn(prev);
      progressRef.current = next;
      saveStored(next);
      return next;
    });
  };

  // Прогресс засчитывается ТОЛЬКО за правильные ответы:
  // высота и дневная цель/стрик растут при known=true; ошибка лишь сбрасывает интервал SRS.
  const review = (phrase, known) => {
    update((prev) => ({
      ...prev,
      xp: (prev.xp || 0) + (known ? XP.correct : 0),
      srs: gradeSrs(prev.srs, phraseId(phrase), known),
      streak: known ? registerActivity(prev.streak) : prev.streak,
      days: known ? bumpDay(prev.days) : prev.days,
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
        : { ...prev, dialogs: { ...(prev.dialogs || {}), [lessonId]: true }, xp: (prev.xp || 0) + XP.dialog, streak: registerActivity(prev.streak), days: bumpDay(prev.days) });
  };

  // Итог экзамена урока: сохраняем лучший результат (для статистики в профиле)
  const recordExam = (lessonId, score, total, passed) => {
    update((prev) => {
      const cur = (prev.exams || {})[lessonId];
      if (cur && cur.score >= score) return prev;
      return { ...prev, exams: { ...(prev.exams || {}), [lessonId]: { score, total, passed, at: Date.now() } } };
    });
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

  // Знакомство при первом запуске: ответы сразу уходят в прогресс
  const finishOnboarding = ({ reason, goal }) => {
    update((p) => ({ ...p, onboarded: true, reason, goal }));
  };

  // Пока прогресс едет из облака Telegram, показываем спокойную заставку
  if (!hydrated) {
    return (
      <div className="app">
        <div className="boot">
          <Mascot className="boot-mascot" src={MASCOT.avatar} alt="" />
          <div className="boot-dots"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  if (!progress.onboarded) {
    return (
      <LangCtx.Provider value={{ lang, t, setLang }}>
        <div className="app">
          <Onboarding
            lang={lang}
            t={t}
            userName={tgUser && tgUser.first_name}
            onDone={finishOnboarding}
          />
        </div>
      </LangCtx.Provider>
    );
  }

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      <div className="app">
        {confetti && <Confetti />}
        <div className="toasts">
          {toasts.map((x) => <div key={x.id} className="toast">{x.msg}</div>)}
        </div>

        <div className="brand">
          <img className="logo" src="/icon-192.png" alt="sitkaz" />
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
          <ModuleView module={activeModule} progress={progress} onOpen={openLesson} onBack={() => setTab("course")} onExam={recordExam} />
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
        {tab === "practice" && <PracticeHub progress={progress} review={review} update={update} />}
        {tab === "stats" && (
          <Stats progress={progress} doneCount={doneCountN} setGoal={(g) => update((p) => ({ ...p, goal: g }))}
            voice={voice} setVoice={changeVoice} />
        )}

        <nav className="nav">
          {[
            { id: "course", ic: "school", label: t.nav_course },
            { id: "practice", ic: "style", label: t.nav_practice },
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
  // Все темы открыты — доступ ко всему курсу без ограничений
  const moduleUnlocked = () => true;

  // Темы, ради которых человек пришёл (ответ на первом запуске)
  const myReason = REASONS.find((r) => r.id === progress.reason) || null;
  const wantedModules = myReason ? myReason.modules : [];

  // Ирбис оживает: нажатие показывает реплику по ситуации и озвучивает казахскую фразу
  const [bubble, setBubble] = useState(null);
  const bubbleTimer = useRef(null);
  const tapIrbis = () => {
    const cheer = IRBIS_CHEERS[Math.floor(Math.random() * IRBIS_CHEERS.length)];
    const line =
      today >= goal ? t.irbis_goal_done
      : streak > 0 && today === 0 ? t.irbis_streak_keep
      : due > 0 ? t.irbis_due(due, phrasesWord(due, t, lang))
      : nextLesson ? t.irbis_continue
      : t.irbis_hi;
    setBubble({ cheer, line });
    speak(cheer.kk);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 4200);
  };

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
            <button className="irbis-btn" onClick={tapIrbis} aria-label={t.irbis_aria}>
              <Mascot src={MASCOT.avatar} className="irbis-idle" alt="Irbis" />
            </button>
            <div className="goal-ring-label">{t.goal_day}</div>
            {bubble && (
              <div className="irbis-bubble" onClick={() => speak(bubble.cheer.kk)}>
                <span className="irbis-bubble-kk">{bubble.cheer.kk}</span>
                <span className="irbis-bubble-sub">{P(bubble.cheer, lang)} · {bubble.line}</span>
              </div>
            )}
          </div>
        </div>
        <div className="chips-row">
          <div className={"chip chip-streak" + (streak > 0 ? " is-lit" : "")}>
            <Icon name="local_fire_department" filled className="flame-icon" /> <b>{streak}</b> {daysWord(streak, t, lang)}
          </div>
          <div className="chip"><Icon name="landscape" filled /> <b>{progress.xp || 0}</b> {lang === "en" ? "m" : "м"}</div>
        </div>
        {nextLesson && (
          <button className="due-btn" onClick={() => onOpen(nextLesson)}>
            <span><Icon name="play_arrow" filled style={{ fontSize: 20, verticalAlign: "-0.25em" }} /> {t.continue}: {nextLesson.title}</span>
            <span>→</span>
          </button>
        )}
        {due > 0 && (
          <button className="repeat-link" onClick={goPractice}>
            <Icon name="autorenew" style={{ fontSize: 16, verticalAlign: "-0.2em" }} /> {t.repeat}: {due} {phrasesWord(due, t, lang)} →
          </button>
        )}
      </div>

      <div className="section-title">
        {t.topics}
        {myReason && (
          <span className="topics-reason">
            <Icon name={myReason.icon} filled /> {lang === "en" ? myReason.en : myReason.ru}
          </span>
        )}
      </div>
      <div className="module-list">
        {modules.map((m, idx) => {
          const items = lessonsByModule(m.id);
          const mDone = items.filter((l) => progress.done[l.id]).length;
          const unlocked = moduleUnlocked(idx);
          const mPct = Math.round((mDone / items.length) * 100);
          const done = mDone === items.length;
          const current = unlocked && !done && (idx === 0 || modules.slice(0, idx).every((pm) => lessonsByModule(pm.id).every((l) => progress.done[l.id])));
          const wanted = !done && wantedModules.includes(m.id);
          return (
            <div
              key={m.id}
              className={"module-row" + (unlocked ? "" : " locked") + (current ? " current" : "") + (wanted ? " wanted" : "")}
              {...clickable(() => onOpenModule(m), unlocked)}
            >
              <div className="module-row-num" style={{ background: unlocked ? m.color : undefined }}>
                {done
                  ? <Icon name="check" style={{ fontSize: 16 }} />
                  : unlocked
                    ? <Icon name={m.icon} filled style={{ fontSize: 18 }} />
                    : <Icon name="lock" style={{ fontSize: 15 }} />}
              </div>
              <div className="module-row-body">
                <h3>{m.title} <span>· {lang === "en" ? m.subtitleEn : m.subtitle}</span></h3>
                <div className="module-row-bar"><div style={{ width: `${mPct}%`, background: m.color }} /></div>
              </div>
              <div className="module-row-count">{mDone}/{items.length}</div>
              {unlocked && <Icon name="chevron_right" style={{ color: "var(--faint)", fontSize: 20, flexShrink: 0 }} />}
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

function ModuleView({ module: m, progress, onOpen, onBack, onExam }) {
  const { lang, t } = useLang();
  const items = lessonsByModule(m.id);
  const mDone = items.filter((l) => progress.done[l.id]).length;
  const mPct = Math.round((mDone / items.length) * 100);

  // Экзамен темы: вопросы всех пройденных уроков (по 5 на урок)
  const [showExam, setShowExam] = useState(false);
  const examQuestions = items.filter((l) => progress.done[l.id]).flatMap((l) => TESTS[l.id] || []);
  const examResult = (progress.exams || {})[m.id];
  if (showExam && examQuestions.length) {
    return <ModuleExam module={m} questions={examQuestions} onRecord={onExam} onBack={() => setShowExam(false)} />;
  }

  // Состав темы: сколько фраз, какого типа, есть ли диалоги и заметки
  const phraseTotal = items.reduce((a, l) => a + l.phrases.length, 0);
  const dialogTotal = items.filter((l) => dialogForLesson(l.id)).length;
  const noteTotal = items.filter((l) => l.note).length;
  const termTotal = items.reduce((a, l) => a + l.phrases.filter((p) => p.type === "term").length, 0);
  const proverbTotal = items.reduce((a, l) => a + l.phrases.filter((p) => p.type === "proverb").length, 0);
  const lessonsWord = (n) => lang === "en"
    ? (n === 1 ? t.lesson_one : t.lesson_many)
    : plural(n, t.lesson_one, t.lesson_few, t.lesson_many);
  const dialogsWord = (n) => lang === "en"
    ? (n === 1 ? t.dialog_one : t.dialog_many)
    : plural(n, t.dialog_one, t.dialog_few, t.dialog_many);

  return (
    <>
      <button className="back" onClick={onBack}><Icon name="arrow_back" style={{ fontSize: 18 }} /> {t.to_topics}</button>

      <div className="module-hero" style={{ borderColor: m.color, "--m-color": m.color }}>
        <Icon name={m.icon} filled className="module-hero-ghost" />
        <div className="module-num" style={{ background: m.color }}>
          <Icon name={m.icon} filled />
        </div>
        <h2>{m.title}</h2>
        <p className="module-hero-sub">{lang === "en" ? m.subtitleEn : m.subtitle}</p>
        <p className="module-hero-desc">{lang === "en" ? m.descEn : m.desc}</p>

        <div className="module-stats">
          <span className="m-stat"><Icon name="menu_book" filled /> <b>{items.length}</b> {lessonsWord(items.length)}</span>
          <span className="m-stat"><Icon name="chat_bubble" filled /> <b>{phraseTotal}</b> {phrasesWord(phraseTotal, t, lang)}</span>
          {dialogTotal > 0 && (
            <span className="m-stat"><Icon name="forum" filled /> <b>{dialogTotal}</b> {dialogsWord(dialogTotal)}</span>
          )}
        </div>
        <div className="module-breakdown">
          {termTotal > 0 && <span><b>{termTotal}</b> {t.m_terms}</span>}
          {proverbTotal > 0 && <span><b>{proverbTotal}</b> {t.m_proverbs}</span>}
          {noteTotal > 0 && <span><b>{noteTotal}</b> {noteTotal === 1 ? t.m_note : t.m_notes}</span>}
        </div>

        <div className="progress-bar" style={{ marginTop: 14 }}>
          <div style={{ width: `${mPct}%`, background: m.color }} />
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>{t.passed_of(mDone, items.length)}</p>
      </div>

      <div className="section-title">{t.lessons}</div>
      <div className="grid">
        {items.map((l) => {
          const unlocked = true; // все уроки открыты
          return (
            <div key={l.id} className={"card" + (unlocked ? "" : " locked")} {...clickable(() => onOpen(l), unlocked)}>
              <div className="lesson-row">
                <div
                  className={"lesson-icon" + (progress.done[l.id] ? " is-done" : "")}
                  style={unlocked ? { color: m.color, background: `color-mix(in srgb, ${m.color} 14%, #fff)` } : undefined}
                >
                  {progress.done[l.id]
                    ? <Icon name="check" filled />
                    : unlocked
                      ? <Icon name={l.icon} filled />
                      : <Icon name="lock" />}
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

      <div className="module-exam-cta">
        <button
          className="btn primary"
          style={{ width: "100%" }}
          disabled={!examQuestions.length}
          onClick={() => setShowExam(true)}
        >
          <Icon name="quiz" style={{ fontSize: 18, verticalAlign: "-0.2em" }} />{" "}
          {t.module_exam}{examQuestions.length ? ` · ${examQuestions.length} ${lang === "en" ? "questions" : "вопр."}` : ""}
        </button>
        <p className="module-exam-hint">
          {examResult
            ? `${examResult.passed ? "✓ " : ""}${lang === "en" ? "Best" : "Лучший"}: ${examResult.score}/${examResult.total}`
            : (examQuestions.length ? t.module_exam_hint : t.module_exam_locked)}
        </p>
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
  const { lang, t } = useLang();
  const mod = modules.find((m) => m.id === lesson.module);
  const dialog = dialogForLesson(lesson.id);
  const nextLesson = lessons.find((l) => l.id === lesson.id + 1) || null;
  const [stage, setStage] = useState("study");
  // Был ли урок пройден ДО этого захода: если да — высота больше не начисляется,
  // значит и обещать «+50 м» на экране результата не нужно.
  const [wasDone] = useState(done);

  const header = (
    <>
      <div className="lesson-topbar">
        <button className="back" style={{ margin: 0 }} onClick={onBack}><Icon name="close" style={{ fontSize: 18 }} /></button>
        <div className="lesson-topbar-title">
          <b>{lesson.title}</b>
          <span>{lang === "en" ? lesson.en : lesson.ru}</span>
        </div>
      </div>
    </>
  );

  if (stage === "dialog" && dialog) {
    return <DialogView dialog={dialog} onBack={() => setStage("study")} onComplete={onDialogComplete} />;
  }
  if (stage === "study") {
    return (<>{header}<StudyTrainer lesson={lesson} onDone={() => setStage("practice")} /></>);
  }
  if (stage === "practice") {
    return (<>{header}<LessonPractice lesson={lesson} review={review} onDone={() => { onPassed(); setStage("complete"); }} /></>);
  }
  // Экзамен теперь общий по теме (см. ModuleExam на экране темы). Урок завершается после практики.
  return (
    <>
      {header}
      <div className="result">
        <Mascot className="mascot-big" src={MASCOT.leap} alt="Irbis" />
        <h2 style={{ color: "var(--heading)", margin: "10px 0 6px" }}>{t.lesson_done_h}</h2>
        <p>{wasDone
          ? (lang === "en" ? "Lesson reviewed. The theme exam awaits on the topic screen." : "Урок повторён. Экзамен темы ждёт на экране темы.")
          : (lang === "en" ? "+50 m of altitude. The theme exam awaits on the topic screen." : "+50 м высоты. Экзамен темы ждёт на экране темы.")}</p>
        {dialog && !dialogDone && (
          <button className="btn ghost" style={{ width: "100%", marginBottom: 10 }} onClick={() => setStage("dialog")}>
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
      </div>
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
    setI(i + 1);
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
        <div className="study-ru">{P(p, lang)}</div>
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
  const q = queue[i];

  const answered = (ok) => {
    review(q.word, ok);
    // Очередь считаем сразу: иначе на последней карточке этап закрывался
    // раньше, чем в неё попадал обещанный повтор ошибочной фразы.
    const nextQueue = ok ? queue : [...queue, makePracticeQ(q.word, lesson)];
    if (!ok) setQueue(nextQueue);
    if (i + 1 >= nextQueue.length) { onDone(); return; }
    setI(i + 1);
  };

  return (
    <>
      <div className="lesson-progress">
        <div className="lesson-progress-bar"><div style={{ width: `${((i + 1) / queue.length) * 100}%` }} /></div>
        <span>{i + 1} / {queue.length}</span>
      </div>
      <div className="q-type">{qLabel(q.type, t)}</div>
      {q.type === "assemble" ? <AssembleQ key={i} q={q} onAnswer={answered} /> : <ChoiceQ key={i} q={q} onAnswer={answered} />}
    </>
  );
}

// ─────────── Мини-экзамен урока ───────────

// В уроке 2–4 фразы. Если делать по вопросу на фразу, порог 80% округляется
// до «без единой ошибки» — поэтому добираем минимум до 3 вопросов, повторяя
// фразы другим типом задания. Порог: одна ошибка допустима (см. LessonQuiz).
const EXAM_MIN_Q = 3;

function makeLessonQuestions(lesson) {
  const base = shuffle(lesson.phrases).slice(0, 5);
  const pool = [...base];
  while (pool.length < Math.min(EXAM_MIN_Q, 5)) pool.push(base[pool.length % base.length]);

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

// Экзамен темы (курс sitkaz.kz): объединяет вопросы всех пройденных уроков темы
// (по 5 на урок), все вопросы сразу, без мгновенной проверки. Порог сдачи: >50%.
function ModuleExam({ module: m, questions, onRecord, onBack }) {
  const { lang, t } = useLang();
  const [answers, setAnswers] = useState(() => questions.map(() => []));
  const [done, setDone] = useState(false);
  const need = Math.floor(questions.length / 2) + 1;

  const isRight = (qi) => {
    const c = [...questions[qi][2]].sort((a, b) => a - b);
    const p = [...answers[qi]].sort((a, b) => a - b);
    return c.length === p.length && c.every((v, k) => v === p[k]);
  };
  const score = questions.reduce((s, _, qi) => s + (isRight(qi) ? 1 : 0), 0);
  const allAnswered = answers.every((a) => a.length > 0);

  const toggle = (qi, idx) => {
    if (done) return;
    const multi = questions[qi][2].length > 1;
    setAnswers((prev) => prev.map((a, k) =>
      k !== qi ? a : (multi ? (a.includes(idx) ? a.filter((x) => x !== idx) : [...a, idx]) : [idx])));
  };
  const submit = () => {
    const passed = score >= need;
    setDone(true);
    onRecord(m.id, score, questions.length, passed);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const restart = () => { setAnswers(questions.map(() => [])); setDone(false); };

  const passed = score >= need;
  return (
    <>
      <button className="back" onClick={onBack}><Icon name="arrow_back" style={{ fontSize: 18 }} /> {t.to_topics}</button>
      <div className="section-title">{t.module_exam} · {m.title}</div>
      <div className="lesson-test">
        {done && (
          <div className={"exam-result " + (passed ? "ok" : "bad")}>
            {passed && <Mascot className="mascot-big" src={MASCOT.leap} alt="Irbis" />}
            <div className="score">{score} / {questions.length}</div>
            <p>{passed
              ? (lang === "en" ? `Керемет! Theme exam passed!` : `Керемет! Экзамен темы сдан!`)
              : t.exam_fail(need, questions.length)}</p>
          </div>
        )}

        {questions.map((q, qi) => {
          const [text, options, correct] = q;
          const multi = correct.length > 1;
          return (
            <div key={qi} className="test-q">
              <div className="test-q-title">
                {qi + 1}. {text}
                {multi && !done && <span className="test-multi"> · {t.test_multi}</span>}
              </div>
              {options.map((opt, idx) => {
                const sel = answers[qi].includes(idx);
                if (done) {
                  const cls = correct.includes(idx) ? "quiz-opt correct" : (sel ? "quiz-opt wrong" : "quiz-opt dim");
                  return <div key={idx} className={cls}>{opt}</div>;
                }
                return (
                  <button key={idx} className={"quiz-opt" + (sel ? " picked" : "")} onClick={() => toggle(qi, idx)}>
                    {opt}
                  </button>
                );
              })}
            </div>
          );
        })}

        {!done ? (
          <button className="btn primary" style={{ width: "100%", marginTop: 4 }} disabled={!allAnswered} onClick={submit}>
            {t.test_finish}
          </button>
        ) : (
          <div className="flash-controls">
            {!passed && <button className="btn primary" onClick={restart}>{t.once_more}</button>}
            <button className="btn primary" onClick={onBack}>{t.to_topics}</button>
          </div>
        )}
      </div>
    </>
  );
}

function LessonQuiz({ lesson, review, onPassed, onBack, nextLesson, onOpen, dialog, dialogDone, onDialog }) {
  const { lang, t } = useLang();
  const [questions, setQuestions] = useState(() => makeLessonQuestions(lesson));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  // Одна ошибка допустима: раньше порог 80% при 2–4 вопросах округлялся
  // до «все верно», и урок не сдавался с единственной опечаткой.
  const need = Math.max(1, questions.length - 1);
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
      <div className="lesson-progress">
        <div className="lesson-progress-bar"><div style={{ width: `${((i + 1) / questions.length) * 100}%` }} /></div>
        <span>{i + 1} / {questions.length}</span>
      </div>
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
              <Mascot className="bubble-avatar" src={MASCOT.avatar} />
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
            <Mascot className="bubble-avatar" src={MASCOT.avatar} />
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

// ─────────────────── Практика: повторение + проверка ───────────────────

function PracticeHub({ progress, review, update }) {
  const { t } = useLang();
  const [mode, setMode] = useState("review"); // review | quiz
  // Тренируем только то, что пользователь уже открыл
  const pool = openPhrases(progress);
  return (
    <>
      <div className="mode-switch">
        <button className={mode === "review" ? "on" : ""} onClick={() => setMode("review")}>
          <Icon name="autorenew" style={{ fontSize: 17, verticalAlign: "-0.2em" }} /> {t.mode_review}
        </button>
        <button className={mode === "quiz" ? "on" : ""} onClick={() => setMode("quiz")}>
          <Icon name="quiz" style={{ fontSize: 17, verticalAlign: "-0.2em" }} /> {t.mode_check}
        </button>
      </div>
      {mode === "review"
        ? <Practice srs={progress.srs} pool={pool} review={review} />
        : <Quiz update={update} review={review} pool={pool} />}
    </>
  );
}

// ─────────────────── Практика (SRS) ───────────────────

// Через сколько карточек вернуть фразу, которую не вспомнили
const RELEARN_GAP = 3;

function Practice({ srs, pool, review }) {
  const { lang, t } = useLang();
  const [deck, setDeck] = useState(() => buildDeck(srs, pool));
  // Повторять нечего и новых фраз нет — колода собрана «просто так»,
  // показываем финальный экран, а свободную практику предлагаем кнопкой.
  const [freeMode, setFreeMode] = useState(false);
  // queue — очередь карточек этой сессии; в неё возвращаются фразы после «Не знаю»
  const [queue, setQueue] = useState(() => deck.cards);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learning, setLearning] = useState(null); // карточка на разборе после «Не знаю»
  // known — сколько раз ответили «Знаю», hard — фразы, которые хоть раз не вспомнили
  const [session, setSession] = useState({ known: 0, hard: new Set() });
  // Сколько фраз ещё не закрыто ответом «Знаю»
  const [pending, setPending] = useState(() => new Set());

  const restart = (free = false) => {
    const d = buildDeck(srs, pool);
    setFreeMode(free || !d.free);
    setDeck(d); setQueue(d.cards); setI(0); setFlipped(false); setLearning(null);
    setSession({ known: 0, hard: new Set() }); setPending(new Set());
  };

  // Всё повторено: колода собралась «свободной» или пустой
  if (!deck.cards.length || (deck.free && !freeMode)) {
    return (
      <div className="practice-done">
        <Mascot className="mascot-sleep" src={MASCOT.sleep} alt="Irbis" />
        <h2 style={{ margin: "10px 0 6px" }}>{t.all_done_today}</h2>
        <p style={{ color: "var(--muted)", marginBottom: deck.cards.length ? 20 : 0 }}>{t.all_reviewed}</p>
        {deck.cards.length > 0 && (
          <button className="btn secondary" style={{ maxWidth: 280 }} onClick={() => setFreeMode(true)}>
            {t.free_practice_start}
          </button>
        )}
      </div>
    );
  }

  if (i >= queue.length) {
    // Считаем фразы, а не показы: карточка «не знаю → потом знаю» — это одна фраза
    const totalN = deck.cards.length;
    const hardN = session.hard.size;
    return (
      <div className="practice-done">
        <Mascot className="mascot-sleep" src={MASCOT.sleep} alt="Irbis" />
        <h2 style={{ margin: "10px 0 6px" }}>{t.session_done}</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>
          {lang === "en"
            ? `${totalN} ${phrasesWord(totalN, t, lang)}: knew ${totalN - hardN}, ${hardN} needed a second look`
            : `${totalN} ${phrasesWord(totalN, t, lang)}: знал ${totalN - hardN}, ${hardN} учили заново`}
        </p>
        <button className="btn primary" style={{ maxWidth: 260 }} onClick={() => restart()}>{t.continue_practice}</button>
      </div>
    );
  }

  const card = queue[i];
  const isRepeat = pending.has(phraseId(card));

  // «Знаю» — фраза закрыта, идём дальше.
  const known = () => {
    review(card, true);
    setSession((s) => ({ ...s, known: s.known + 1 }));
    setPending((p) => { const n = new Set(p); n.delete(phraseId(card)); return n; });
    setFlipped(false);
    setI((v) => v + 1);
  };

  // «Не знаю» — показываем разбор, фраза уходит в обучение и вернётся в этой же сессии.
  const dontKnow = () => {
    review(card, false);
    setSession((s) => ({ ...s, hard: new Set(s.hard).add(phraseId(card)) }));
    setPending((p) => new Set(p).add(phraseId(card)));
    speak(card.kk);
    setLearning(card);
  };

  // Возврат карточки в очередь через RELEARN_GAP позиций
  const continueAfterLearning = () => {
    setQueue((q) => {
      const next = [...q];
      next.splice(Math.min(i + 1 + RELEARN_GAP, next.length), 0, card);
      return next;
    });
    setLearning(null);
    setFlipped(false);
    setI((v) => v + 1);
  };

  if (learning) {
    return (
      <>
        <div className="section-title">
          {t.card} {i + 1} / {queue.length} · {t.sess_known}: {session.known} · {t.sess_learning}: {pending.size}
        </div>
        <div className="flash-wrap">
          <Mascot className="mascot-peek" src={MASCOT.peek} />
          <div className="flash is-learning">
            <div>
              <div className="learn-label"><Icon name="school" filled /> {t.learn_title}</div>
              <div className="big">{learning.kk}</div>
              <div className="sub">
                [{learning.tr}]{" "}
                <button className="speak-btn" onClick={() => speak(learning.kk)} aria-label={t.play_audio}>
                  <Icon name="volume_up" />
                </button>
              </div>
              <div className="learn-tr">{P(learning, lang)}</div>
              <div className="learn-note">{t.learn_sub}</div>
            </div>
          </div>
          <div className="flash-controls">
            <button className="btn primary" style={{ width: "100%" }} onClick={continueAfterLearning}>{t.got_it}</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="section-title">
        {t.card} {i + 1} / {queue.length} · {t.sess_known}: {session.known} · {t.sess_learning}: {pending.size}
      </div>
      <div className="flash-wrap">
        <Mascot className="mascot-peek" src={MASCOT.peek} />
        <div className="flash" {...clickable(() => { setFlipped((f) => !f); if (!flipped) speak(card.kk); })}>
          {isRepeat && <span className="flash-repeat"><Icon name="autorenew" /> {t.card_again}</span>}
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
          <button className="btn bad" onClick={dontKnow}>{t.dont_know}</button>
          <button className="btn good" onClick={known}>{t.know}</button>
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

// Вопросы строим по открытым фразам; неверные варианты можно брать
// из всего курса — они служат фоном и не требуют знания урока.
function makeQuestions(pool = allPhrases) {
  const picked = shuffle(pool).slice(0, 10);
  return picked.map((w) => {
    const words = w.kk.split(/\s+/).filter(Boolean);
    const types = ["kk2ru", "ru2kk", "listen"];
    if (words.length >= 3 && words.length <= 8) types.push("assemble", "assemble");
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === "assemble") return { type, word: w, words: shuffle(words) };
    const wrong = shuffle(allPhrases.filter((x) => x.kk !== w.kk)).slice(0, 3);
    return { type, word: w, options: shuffle([w, ...wrong]) };
  });
}

function Quiz({ update, review, pool }) {
  const { t } = useLang();
  const [questions, setQuestions] = useState(() => makeQuestions(pool));
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

  const restart = () => { setQuestions(makeQuestions(pool)); setI(0); setScore(0); setDone(false); };

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

// Панель разбора ответа: правильный вариант + озвучка + «Дальше»
// Сначала целиком проигрываем правильное произношение; только когда звук
// доиграл, даём паузу «осознать» и переходим дальше — авто-переход не режет аудио.
// Неверный ответ можно пролистнуть тапом раньше.
const GRACE_OK = 1100;   // пауза после озвучки на верном ответе
const GRACE_BAD = 2200;  // пауза после озвучки на неверном (плюс можно тапнуть)
function AnswerFeedback({ ok, word, lang, t, onContinue }) {
  const fired = useRef(false);
  const go = () => { if (fired.current) return; fired.current = true; onContinue(ok); };
  useEffect(() => {
    let graceId;
    let started = false;
    const startGrace = () => { if (started) return; started = true; graceId = setTimeout(go, ok ? GRACE_OK : GRACE_BAD); };
    // Страховка: если аудио не запустится или не пришлёт событие конца —
    // всё равно пойдём дальше, не подвиснем.
    const fallback = setTimeout(startGrace, 4500);
    speak(word.kk, { onEnd: () => { clearTimeout(fallback); startGrace(); } });
    return () => { clearTimeout(graceId); clearTimeout(fallback); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      className={"answer-fb " + (ok ? "ok" : "bad")}
      onClick={ok ? undefined : go}
      style={ok ? undefined : { cursor: "pointer" }}
    >
      <div className="answer-fb-head">
        <Icon name={ok ? "check_circle" : "cancel"} filled /> {ok ? t.fb_correct : t.fb_wrong}
      </div>
      {!ok && (
        <div className="answer-fb-correct" onClick={(e) => { e.stopPropagation(); speak(word.kk); }}>
          <b>{word.kk}</b> <span>· {P(word, lang)}</span> <Icon name="volume_up" style={{ fontSize: 15 }} />
        </div>
      )}
    </div>
  );
}

function ChoiceQ({ q, onAnswer }) {
  const { lang, t } = useLang();
  const [picked, setPicked] = useState(null);

  useEffect(() => { if (q.type === "listen") speak(q.word.kk); }, [q]);

  const isCorrect = (o) => o.kk === q.word.kk;
  const answered = picked !== null;
  const ok = answered && isCorrect(picked);

  const pick = (opt) => {
    if (answered) return;
    setPicked(opt);
    // Озвучку и тайминг перехода ведёт AnswerFeedback — здесь не дублируем
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
        if (answered) {
          if (isCorrect(opt)) cls += " correct";
          else if (opt === picked) cls += " wrong";
          else cls += " dim";
        }
        return (
          <button key={opt.kk} className={cls} disabled={answered} onClick={() => pick(opt)}>
            {q.type === "ru2kk" ? opt.kk : P(opt, lang)}
          </button>
        );
      })}

      {answered && <AnswerFeedback ok={ok} word={q.word} lang={lang} t={t} onContinue={onAnswer} />}
    </>
  );
}

function AssembleQ({ q, onAnswer }) {
  const { lang, t } = useLang();
  const [picked, setPicked] = useState([]);
  const [state, setState] = useState(null); // null | ok | bad
  const target = q.word.kk.split(/\s+/).filter(Boolean).join(" ");
  const answered = state !== null;
  const ok = state === "ok";

  const pickWord = (idx) => {
    if (answered || picked.includes(idx)) return;
    const next = [...picked, idx];
    setPicked(next);
    if (next.length === q.words.length) {
      const answer = next.map((j) => q.words[j]).join(" ");
      const good = answer === target;
      setState(good ? "ok" : "bad");
      // Озвучку и тайминг перехода ведёт AnswerFeedback — здесь не дублируем
    }
  };

  const unpick = (pos) => { if (!answered) setPicked(picked.filter((_, j) => j !== pos)); };

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
          <button key={idx} className="word-chip" disabled={answered || picked.includes(idx)} onClick={() => pickWord(idx)}>{w}</button>
        ))}
      </div>

      {answered && <AnswerFeedback ok={ok} word={q.word} lang={lang} t={t} onContinue={onAnswer} />}
    </>
  );
}

// ────────────────────────── Прогресс ──────────────────────────

// Кнопка «Добавить на главный экран» — только в Telegram, где это поддерживается
function AddToHomeButton() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (!tg || typeof tg.addToHomeScreen !== "function") return;
    try {
      if (typeof tg.checkHomeScreenStatus === "function") {
        tg.checkHomeScreenStatus((status) => {
          const s = typeof status === "string" ? status : (status && status.status);
          setShow(s !== "added" && s !== "unsupported");
        });
      } else {
        setShow(true);
      }
    } catch { setShow(true); }
  }, []);
  if (!show) return null;
  const add = () => {
    try { window.Telegram.WebApp.addToHomeScreen(); } catch {}
    // На iOS Telegram часто ничего не делает (известный баг) — показываем запасной путь
    setHint(true);
  };
  return (
    <>
      <button className="btn secondary" style={{ width: "100%", marginTop: 12 }} onClick={add}>
        <Icon name="add_to_home_screen" style={{ fontSize: 18, verticalAlign: "-0.2em" }} /> {t.add_home}
      </button>
      {hint && <p className="module-exam-hint">{t.add_home_hint}</p>}
    </>
  );
}

// Тепловая карта активности: последние недели по дням (в стиле GitHub).
const CAL_WEEKS = 13;
const calColor = (c) => c === 0 ? "#E8EEF4" : c < 3 ? "#F7C99A" : c < 8 ? "#F2953C" : "#D9781F";

function ActivityCalendar({ days }) {
  const { t } = useLang();
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = понедельник
  const cols = [];
  for (let col = 0; col < CAL_WEEKS; col++) {
    const cells = [];
    for (let row = 0; row < 7; row++) {
      const offset = (col - (CAL_WEEKS - 1)) * 7 + (row - dow);
      if (offset > 0) { cells.push(null); continue; } // будущие дни этой недели
      const d = new Date(today.getTime() + offset * 86400000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      cells.push({ key, c: (days && days[key]) || 0 });
    }
    cols.push(cells);
  }
  return (
    <>
      <div className="section-title" style={{ marginTop: 18 }}>{t.cal_title}</div>
      <div style={{ display: "flex", gap: 3, justifyContent: "center", padding: "2px 0 6px" }}>
        {cols.map((cells, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {cells.map((cell, ri) => (
              <div key={ri} title={cell ? `${cell.key}: ${cell.c}` : ""} style={{
                width: 12, height: 12, borderRadius: 3,
                background: cell ? calColor(cell.c) : "transparent",
              }} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function Stats({ progress, doneCount, setGoal, voice, setVoice }) {
  const { lang, t } = useLang();
  const total = lessons.length;
  const pct = Math.round((doneCount / total) * 100);
  const streak = displayStreak(progress.streak);
  const today = doneToday(progress.streak);
  const goal = progress.goal || 10;
  const due = dueCount(progress.srs);
  const learned = learnedCount(progress.srs);
  const fz = freezeStatus(progress.streak);
  const inWork = Object.keys(progress.srs).length;
  const lv = levelInfo(progress.xp || 0);
  const unit = lang === "en" ? "m" : "м";
  const examsPassed = modules.filter((mm) => (progress.exams || {})[mm.id] && progress.exams[mm.id].passed).length;

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

      <div className="stat-row" style={{ marginBottom: 4 }}>
        <div className="stat"><div className="num"><Icon name="local_fire_department" filled style={{ fontSize: 20, color: "var(--amber)" }} /> {streak}</div><div className="lbl">{daysWord(streak, t, lang)} {t.st_days}</div></div>
        <div className="stat"><div className="num">{today}/{goal}</div><div className="lbl">{t.st_today}</div></div>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginBottom: 12, opacity: fz.ready ? 1 : 0.7 }}>
        <Icon name="ac_unit" filled={fz.ready} style={{ fontSize: 14, verticalAlign: "-0.2em", color: fz.ready ? "var(--amber)" : "var(--faint)" }} />{" "}
        {fz.ready ? t.freeze_ready : t.freeze_used}
      </p>

      <div className="goal-picker">
        <span className="goal-picker-label">{t.goal_change}</span>
        {[5, 10, 20].map((g) => (
          <button key={g} className={goal === g ? "on" : ""} onClick={() => setGoal(g)}>{g}</button>
        ))}
      </div>

      <div className="goal-picker">
        <span className="goal-picker-label">{t.voice_label}</span>
        {[["aigul", t.voice_aigul], ["daulet", t.voice_daulet]].map(([v, label]) => (
          <button
            key={v}
            className={voice === v ? "on" : ""}
            onClick={() => { setVoice(v); if (allPhrases[0]) speak(allPhrases[0].kk); }}
          >
            {label}
          </button>
        ))}
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
        <div className="stat"><div className="num">{examsPassed}/{modules.length}</div><div className="lbl">{t.st_exams}</div></div>
        <div className="stat"><div className="num">{progress.quizzes || 0}</div><div className="lbl">{t.st_quizzes}</div></div>
        <div className="stat"><div className="num">{progress.bestScore || 0}/10</div><div className="lbl">{t.st_best}</div></div>
      </div>

      <ActivityCalendar days={progress.days} />

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

      <AddToHomeButton />
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
