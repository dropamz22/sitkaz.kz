"use client";

import { useEffect, useState } from "react";
import { modules, lessons, lessonsByModule, allPhrases } from "../data/course";
import {
  phraseId, shuffle, gradeSrs, dueCount, learnedCount,
  buildDeck, registerActivity, displayStreak, doneToday,
} from "../lib/srs";

const STORE_KEY = "sitkaz_progress_v3";
const EMPTY = {
  done: {}, quizzes: 0, bestScore: 0,
  srs: {}, streak: { count: 0, last: null, todayCount: 0 }, goal: 10,
};

function loadProgress() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const v3 = JSON.parse(localStorage.getItem(STORE_KEY));
    if (v3) return { ...EMPTY, ...v3, streak: { ...EMPTY.streak, ...(v3.streak || {}) } };
    const v2 = JSON.parse(localStorage.getItem("sitkaz_progress_v2"));
    if (v2) return { ...EMPTY, ...v2 }; // миграция со старой версии
  } catch {}
  return EMPTY;
}

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "kk-KZ";
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export default function App() {
  const [tab, setTab] = useState("course");
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState(EMPTY);

  useEffect(() => {
    setProgress(loadProgress());
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (tg) {
      try { tg.ready(); tg.expand(); } catch {}
    }
  }, []);

  const update = (fn) => {
    setProgress((prev) => {
      const next = fn(prev);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Одна оценка фразы: обновляет SRS + стрик/цель
  const review = (phrase, known) => {
    update((prev) => ({
      ...prev,
      srs: gradeSrs(prev.srs, phraseId(phrase), known),
      streak: registerActivity(prev.streak),
    }));
  };

  const markDone = (lessonId) => {
    update((prev) => (prev.done[lessonId] ? prev : { ...prev, done: { ...prev.done, [lessonId]: true } }));
  };

  const openLesson = (l) => { setActiveLesson(l); setTab("lesson"); };
  const doneCountN = Object.keys(progress.done).length;

  return (
    <div className="app">
      <div className="brand">
        <div className="logo">Қ</div>
        <div>
          <h1>sitkaz.kz</h1>
          <span>Ситуативный казахский</span>
        </div>
      </div>

      {tab === "course" && (
        <Course progress={progress} doneCount={doneCountN} onOpen={openLesson} goPractice={() => setTab("practice")} />
      )}
      {tab === "lesson" && activeLesson && (
        <LessonView
          lesson={activeLesson}
          done={!!progress.done[activeLesson.id]}
          onDone={() => markDone(activeLesson.id)}
          onPractice={() => setTab("practice")}
          onBack={() => setTab("course")}
        />
      )}
      {tab === "practice" && <Practice srs={progress.srs} review={review} />}
      {tab === "quiz" && <Quiz update={update} review={review} />}
      {tab === "stats" && <Stats progress={progress} doneCount={doneCountN} />}

      <nav className="nav">
        {[
          { id: "course", ic: "📚", label: "Курс" },
          { id: "practice", ic: "🃏", label: "Практика" },
          { id: "quiz", ic: "✅", label: "Квиз" },
          { id: "stats", ic: "📊", label: "Прогресс" },
        ].map((t) => (
          <button
            key={t.id}
            className={tab === t.id || (t.id === "course" && tab === "lesson") ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            <span className="ic">{t.ic}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ────────────────────────── Курс ──────────────────────────

function Course({ progress, doneCount, onOpen, goPractice }) {
  const total = lessons.length;
  const pct = Math.round((doneCount / total) * 100);
  const due = dueCount(progress.srs);
  const streak = displayStreak(progress.streak);
  const today = doneToday(progress.streak);
  const goal = progress.goal || 10;

  return (
    <>
      <div className="hero">
        <h2>Сәлеметсіз бе! 👋</h2>
        <p>Курс разговорного казахского по методике «Ситуативный казахский»: 3 модуля, 20 уроков. Учим готовые фразы для реальных ситуаций.</p>
        <div className="chips-row">
          <div className="chip">🔥 <b>{streak}</b> {plural(streak, "день", "дня", "дней")}</div>
          <div className="chip">🎯 сегодня <b>{today}</b>/{goal}</div>
          <div className="chip">🔁 повторить <b>{due}</b></div>
        </div>
        {today < goal ? (
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div style={{ width: `${Math.min(100, Math.round((today / goal) * 100))}%` }} />
          </div>
        ) : (
          <p style={{ marginTop: 10 }}>🎉 Цель на сегодня выполнена!</p>
        )}
        {due > 0 && (
          <button className="due-btn" onClick={goPractice}>
            Повторить сегодня: {due} {plural(due, "фразу", "фразы", "фраз")} →
          </button>
        )}
      </div>

      {modules.map((m) => {
        const items = lessonsByModule(m.id);
        const mDone = items.filter((l) => progress.done[l.id]).length;
        return (
          <div key={m.id} style={{ marginBottom: 22 }}>
            <div className="module-head" style={{ borderColor: m.color }}>
              <div className="module-num" style={{ background: m.color }}>{m.num}</div>
              <div>
                <h3>{m.title} · <span style={{ color: "var(--muted)", fontWeight: 400 }}>{m.subtitle}</span></h3>
                <p>{m.desc}</p>
              </div>
              <div className="module-count">{mDone}/{items.length}</div>
            </div>
            <div className="grid" style={{ marginTop: 10 }}>
              {items.map((l) => (
                <div key={l.id} className="card" onClick={() => onOpen(l)}>
                  <div className="lesson-row">
                    <div className="lesson-icon" style={{ color: m.color }}>{progress.done[l.id] ? "✓" : l.id}</div>
                    <div className="lesson-meta">
                      <h3>{l.title}</h3>
                      <p>{l.ru}</p>
                    </div>
                    <div className="lesson-count">{l.phrases.length} фраз →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 8 }}>
        Пройдено {doneCount} из {total} уроков ({pct}%)
      </p>
    </>
  );
}

// ────────────────────────── Урок ──────────────────────────

function LessonView({ lesson, done, onDone, onPractice, onBack }) {
  const mod = modules.find((m) => m.id === lesson.module);
  return (
    <>
      <button className="back" onClick={onBack}>← К списку уроков</button>
      <div className="section-title" style={{ color: mod?.color }}>
        Урок {lesson.id} · {mod?.title}
      </div>
      <h2 style={{ marginBottom: 4 }}>{lesson.title}</h2>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>{lesson.ru}</p>

      <div className="video-box">
        {lesson.video ? (
          <iframe src={lesson.video} title={lesson.title} allowFullScreen />
        ) : (
          <div className="video-placeholder">
            <div style={{ fontSize: 34 }}>▶️</div>
            <div>Видео-лекция появится здесь</div>
            <small>Добавьте ссылку в поле <code>video</code> урока</small>
          </div>
        )}
      </div>

      <div className="section-title">Ситуативные фразы</div>
      {lesson.phrases.map((p) => (
        <div key={p.kk} className="word-card" onClick={() => speak(p.kk)}>
          <div className="kk">{p.kk}</div>
          <div className="ru">{p.ru}</div>
          <div className="tr">[{p.tr}] 🔊</div>
        </div>
      ))}

      <div className="flash-controls" style={{ marginTop: 16 }}>
        <button className="btn ghost" onClick={onPractice}>🃏 Практика</button>
        <button className={done ? "btn ghost" : "btn good"} onClick={onDone}>
          {done ? "Урок пройден ✓" : "Отметить пройденным"}
        </button>
      </div>
    </>
  );
}

// ─────────────────── Практика (карточки + SRS) ───────────────────

function Practice({ srs, review }) {
  const [deck, setDeck] = useState(() => buildDeck(srs, allPhrases));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({ known: 0, unknown: 0 });

  const restart = () => {
    setDeck(buildDeck(srs, allPhrases));
    setI(0);
    setFlipped(false);
    setSession({ known: 0, unknown: 0 });
  };

  if (!deck.cards.length) {
    return (
      <div className="practice-done">
        <div style={{ fontSize: 40 }}>🎉</div>
        <h2 style={{ margin: "10px 0 6px" }}>На сегодня всё!</h2>
        <p style={{ color: "var(--muted)" }}>Все фразы повторены. Возвращайся завтра.</p>
      </div>
    );
  }

  if (i >= deck.cards.length) {
    const total = session.known + session.unknown;
    return (
      <div className="practice-done">
        <div style={{ fontSize: 40 }}>✅</div>
        <h2 style={{ margin: "10px 0 6px" }}>Сессия завершена</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>
          {total} {plural(total, "фраза", "фразы", "фраз")}: знал {session.known}, повторим ещё {session.unknown}
        </p>
        <button className="btn primary" style={{ maxWidth: 260 }} onClick={restart}>Продолжить практику</button>
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
        Карточка {i + 1} / {deck.cards.length}
        {deck.free
          ? " · свободная практика"
          : ` · повторение: ${deck.due} · новых: ${deck.fresh}`}
      </div>
      <div className="flash-wrap">
        <div className="flash" onClick={() => { setFlipped((f) => !f); if (!flipped) speak(card.kk); }}>
          {!flipped ? (
            <div>
              <div className="big">{card.kk}</div>
              <div className="sub">[{card.tr}] 🔊</div>
              <div className="hint">Нажми, чтобы увидеть перевод</div>
            </div>
          ) : (
            <div>
              <div className="big" style={{ fontSize: 24 }}>{card.ru}</div>
              <div className="hint">{card.lesson}</div>
            </div>
          )}
        </div>
        <div className="flash-controls">
          <button className="btn bad" onClick={() => grade(false)}>Не знаю</button>
          <button className="btn good" onClick={() => grade(true)}>Знаю ✓</button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center" }}>
          «Знаю» — фраза вернётся позже (1 → 3 → 7 → 21 день). «Не знаю» — повторим сегодня.
        </p>
      </div>
    </>
  );
}

// ────────────────────────── Квиз ──────────────────────────

const Q_LABEL = {
  kk2ru: "Переведи на русский",
  ru2kk: "Как это по-казахски?",
  listen: "Аудирование: послушай и выбери",
  assemble: "Собери фразу из слов",
};

function makeQuestions() {
  const pool = shuffle(allPhrases).slice(0, 10);
  return pool.map((w) => {
    const words = w.kk.split(/\s+/).filter(Boolean);
    const types = ["kk2ru", "ru2kk", "listen"];
    if (words.length >= 3 && words.length <= 8) types.push("assemble", "assemble");
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === "assemble") return { type, word: w, words: shuffle(words) };
    const wrong = shuffle(allPhrases.filter((x) => x.ru !== w.ru)).slice(0, 3);
    return { type, word: w, options: shuffle([w, ...wrong]) };
  });
}

function Quiz({ update, review }) {
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
      update((prev) => ({
        ...prev,
        quizzes: (prev.quizzes || 0) + 1,
        bestScore: Math.max(prev.bestScore || 0, s),
      }));
      setDone(true);
    } else {
      setI(i + 1);
    }
  };

  const restart = () => { setQuestions(makeQuestions()); setI(0); setScore(0); setDone(false); };

  if (done) {
    return (
      <div className="result">
        <div className="section-title">Результат</div>
        <div className="score">{score} / {questions.length}</div>
        <p>{score >= 8 ? "Керемет! Отлично! 🎉" : score >= 5 ? "Жақсы! Хороший результат 👍" : "Давай ещё разок 💪"}</p>
        <button className="btn primary" onClick={restart}>Пройти снова</button>
      </div>
    );
  }

  return (
    <>
      <div className="quiz-progress">Вопрос {i + 1} из {questions.length} · очки: {score}</div>
      <div className="q-type">{Q_LABEL[q.type]}</div>
      {q.type === "assemble"
        ? <AssembleQ key={i} q={q} onAnswer={answered} />
        : <ChoiceQ key={i} q={q} onAnswer={answered} />}
    </>
  );
}

// Вопрос с вариантами: kk→ru, ru→kk, аудирование
function ChoiceQ({ q, onAnswer }) {
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    if (q.type === "listen") speak(q.word.kk);
  }, [q]);

  const isCorrect = (o) => o.kk === q.word.kk && o.ru === q.word.ru;

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
          <div className="quiz-q" onClick={() => speak(q.word.kk)}>{q.word.kk} 🔊</div>
          <div className="quiz-sub">[{q.word.tr}]</div>
        </>
      )}
      {q.type === "ru2kk" && <div className="quiz-q" style={{ fontSize: 22 }}>{q.word.ru}</div>}
      {q.type === "listen" && (
        <>
          <button className="listen-btn" onClick={() => speak(q.word.kk)}>🔊</button>
          <div className="quiz-sub">нажми, чтобы прослушать ещё раз</div>
        </>
      )}

      {q.options.map((opt) => {
        let cls = "quiz-opt";
        if (picked) {
          if (isCorrect(opt)) cls += " correct";
          else if (opt === picked) cls += " wrong";
        }
        return (
          <button key={opt.kk + opt.ru} className={cls} onClick={() => pick(opt)}>
            {q.type === "ru2kk" ? opt.kk : opt.ru}
          </button>
        );
      })}
      {picked && q.type === "listen" && (
        <p style={{ textAlign: "center", color: "var(--accent)", fontStyle: "italic" }}>
          {q.word.kk} · [{q.word.tr}]
        </p>
      )}
    </>
  );
}

// «Собери фразу из слов»
function AssembleQ({ q, onAnswer }) {
  const [picked, setPicked] = useState([]); // индексы в q.words
  const [state, setState] = useState(null); // null | "ok" | "bad"
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

  const unpick = (pos) => {
    if (state) return;
    setPicked(picked.filter((_, j) => j !== pos));
  };

  return (
    <>
      <div className="quiz-q" style={{ fontSize: 20 }}>{q.word.ru}</div>
      <div className={"assemble-line" + (state === "ok" ? " assemble-ok" : state === "bad" ? " assemble-bad" : "")}>
        {picked.map((idx, pos) => (
          <button key={idx} className="word-chip" onClick={() => unpick(pos)}>{q.words[idx]}</button>
        ))}
        {!picked.length && <span style={{ color: "var(--muted)", fontSize: 14, alignSelf: "center" }}>Нажимай на слова по порядку</span>}
      </div>
      <div className="word-bank">
        {q.words.map((w, idx) => (
          <button key={idx} className="word-chip" disabled={picked.includes(idx)} onClick={() => pickWord(idx)}>
            {w}
          </button>
        ))}
      </div>
      {state === "bad" && (
        <p style={{ textAlign: "center", color: "var(--bad)" }}>
          Правильно: <span style={{ color: "var(--text)" }}>{q.word.kk}</span>
        </p>
      )}
      {state === "ok" && <p style={{ textAlign: "center", color: "var(--good)" }}>Дұрыс! Верно ✓</p>}
    </>
  );
}

// ────────────────────────── Прогресс ──────────────────────────

function Stats({ progress, doneCount }) {
  const total = lessons.length;
  const pct = Math.round((doneCount / total) * 100);
  const streak = displayStreak(progress.streak);
  const today = doneToday(progress.streak);
  const goal = progress.goal || 10;
  const due = dueCount(progress.srs);
  const learned = learnedCount(progress.srs);
  const inWork = Object.keys(progress.srs).length;

  return (
    <>
      <div className="section-title">Твой прогресс</div>
      <div className="stat-row" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="num">🔥 {streak}</div><div className="lbl">{plural(streak, "день", "дня", "дней")} подряд</div></div>
        <div className="stat"><div className="num">{today}/{goal}</div><div className="lbl">фраз сегодня</div></div>
      </div>
      <div className="stat-row" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="num">{learned}</div><div className="lbl">фраз выучено</div></div>
        <div className="stat"><div className="num">{inWork}</div><div className="lbl">фраз в работе</div></div>
        <div className="stat"><div className="num">{due}</div><div className="lbl">к повторению</div></div>
      </div>
      <div className="stat-row" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="num">{doneCount}</div><div className="lbl">уроков пройдено</div></div>
        <div className="stat"><div className="num">{pct}%</div><div className="lbl">курса</div></div>
      </div>
      <div className="stat-row">
        <div className="stat"><div className="num">{progress.quizzes || 0}</div><div className="lbl">квизов пройдено</div></div>
        <div className="stat"><div className="num">{progress.bestScore || 0}/10</div><div className="lbl">лучший результат</div></div>
      </div>
      <div className="hero" style={{ marginTop: 16 }}>
        <h2>Так держать! 🚀</h2>
        <p>Проходи по одному уроку в день и закрепляй фразы в практике. Регулярность важнее объёма — фразы возвращаются ровно тогда, когда мозг готов их забыть.</p>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
      </div>
    </>
  );
}
