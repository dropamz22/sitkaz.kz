"use client";

import { useEffect, useState } from "react";
import { modules, lessons, lessonsByModule, allPhrases } from "../data/course";

const STORE_KEY = "sitkaz_progress_v2";

function loadProgress() {
  if (typeof window === "undefined") return { done: {}, learned: {}, quizzes: 0, bestScore: 0 };
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { done: {}, learned: {}, quizzes: 0, bestScore: 0 };
  } catch {
    return { done: {}, learned: {}, quizzes: 0, bestScore: 0 };
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "kk-KZ";
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function App() {
  const [tab, setTab] = useState("course");
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState({ done: {}, learned: {}, quizzes: 0, bestScore: 0 });

  useEffect(() => {
    setProgress(loadProgress());
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (tg) {
      try { tg.ready(); tg.expand(); } catch {}
    }
  }, []);

  const save = (next) => {
    setProgress(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch {}
  };

  const markDone = (lessonId) => {
    if (progress.done[lessonId]) return;
    save({ ...progress, done: { ...progress.done, [lessonId]: true } });
  };

  const openLesson = (l) => { setActiveLesson(l); setTab("lesson"); };

  const doneCount = Object.keys(progress.done).length;

  return (
    <div className="app">
      <div className="brand">
        <div className="logo">Қ</div>
        <div>
          <h1>sitkaz.kz</h1>
          <span>Ситуативный казахский</span>
        </div>
      </div>

      {tab === "course" && <Course progress={progress} doneCount={doneCount} onOpen={openLesson} />}
      {tab === "lesson" && activeLesson && (
        <LessonView
          lesson={activeLesson}
          done={!!progress.done[activeLesson.id]}
          onDone={() => markDone(activeLesson.id)}
          onPractice={() => setTab("practice")}
          onBack={() => setTab("course")}
        />
      )}
      {tab === "practice" && <Practice />}
      {tab === "quiz" && <Quiz progress={progress} onSave={save} />}
      {tab === "stats" && <Stats progress={progress} doneCount={doneCount} />}

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

function Course({ progress, doneCount, onOpen }) {
  const total = lessons.length;
  const pct = Math.round((doneCount / total) * 100);
  return (
    <>
      <div className="hero">
        <h2>Сәлеметсіз бе! 👋</h2>
        <p>Курс разговорного казахского по методике «Ситуативный казахский»: 3 модуля, 20 уроков. Учим готовые фразы для реальных ситуаций.</p>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
        <p style={{ marginTop: 8 }}>Пройдено {doneCount} из {total} уроков ({pct}%)</p>
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
    </>
  );
}

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

      {/* Видео-лекция */}
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

function Practice() {
  const [deck, setDeck] = useState(() => shuffle(allPhrases));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck[i];

  const next = () => { setFlipped(false); setI((v) => (v + 1) % deck.length); };
  const reshuffle = () => { setDeck(shuffle(allPhrases)); setI(0); setFlipped(false); };

  return (
    <>
      <div className="section-title">Карточки · {i + 1} / {deck.length}</div>
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
          <button className="btn ghost" onClick={next}>Следующая →</button>
          <button className="btn good" onClick={next}>Знаю ✓</button>
        </div>
        <button className="btn ghost" onClick={reshuffle} style={{ marginTop: 4 }}>🔀 Перемешать заново</button>
      </div>
    </>
  );
}

function makeQuestions() {
  const pool = shuffle(allPhrases).slice(0, 10);
  return pool.map((w) => {
    const wrong = shuffle(allPhrases.filter((x) => x.ru !== w.ru)).slice(0, 3);
    return { word: w, options: shuffle([w, ...wrong]) };
  });
}

function Quiz({ progress, onSave }) {
  const [questions, setQuestions] = useState(makeQuestions);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[i];

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    const correct = opt.ru === q.word.ru;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 >= questions.length) {
        const finalScore = correct ? score + 1 : score;
        onSave({
          ...progress,
          quizzes: (progress.quizzes || 0) + 1,
          bestScore: Math.max(progress.bestScore || 0, finalScore),
        });
        setDone(true);
      } else {
        setI((v) => v + 1);
        setPicked(null);
      }
    }, 900);
  };

  const restart = () => { setQuestions(makeQuestions()); setI(0); setPicked(null); setScore(0); setDone(false); };

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
      <div className="quiz-q" onClick={() => speak(q.word.kk)}>{q.word.kk} 🔊</div>
      <div className="quiz-sub">[{q.word.tr}]</div>
      {q.options.map((opt) => {
        let cls = "quiz-opt";
        if (picked) {
          if (opt.ru === q.word.ru) cls += " correct";
          else if (opt.ru === picked.ru) cls += " wrong";
        }
        return (
          <button key={opt.kk + opt.ru} className={cls} onClick={() => pick(opt)}>{opt.ru}</button>
        );
      })}
      <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 10 }}>
        Выбери правильный перевод казахской фразы.
      </p>
    </>
  );
}

function Stats({ progress, doneCount }) {
  const total = lessons.length;
  const pct = Math.round((doneCount / total) * 100);
  return (
    <>
      <div className="section-title">Твой прогресс</div>
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
        <p>Проходи по одному уроку в день и закрепляй фразы в практике. Регулярность важнее объёма.</p>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
      </div>
    </>
  );
}
