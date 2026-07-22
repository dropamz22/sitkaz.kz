# sitkaz.kz — дизайн-бриф для Stitch

Как пользоваться: Stitch генерирует по одному экрану за раз. Для каждого экрана
вставляй **Общий стиль** + промпт нужного экрана. Все промпты на английском —
так Stitch работает точнее. Тексты в макетах — русские и казахские (указаны в промптах).

---

## Общий стиль (вставлять в начало каждого промпта)

```
Design a mobile screen for "sitkaz.kz" — a Telegram Mini App for learning
conversational Kazakh language (3 modules, 20 lessons: phrases, video lectures,
flashcards, quizzes, chat-style dialogues, XP levels and achievements).

Visual style: modern dark UI infused with Kazakh national identity.
Dark deep-blue/charcoal background, turquoise (#00C2B8) as primary accent
(the color of the Kazakh flag), warm gold/yellow (#FFD45E) as secondary accent.
Subtle traditional Kazakh ornament patterns (қошқар мүйіз / ram's horn motif)
used sparingly: as thin decorative borders, card corners, section dividers and
progress-bar textures — elegant and minimal, never overwhelming.
Rounded cards (16px radius), soft glows around accents, generous spacing.
Typography: clean geometric sans-serif with full Cyrillic + Kazakh support
(ә, ғ, қ, ң, ө, ұ, ү, һ, і). Kazakh phrases displayed large and bold,
Russian translations smaller and muted.
Mobile 390×844, single column, bottom tab bar with 4 tabs:
Курс (books icon), Практика (cards icon), Квиз (checkmark icon),
Прогресс (chart icon). App header: logo tile with letter "Қ" in a
turquoise-gold gradient + wordmark "sitkaz.kz", and a small gold pill
showing user level "⭐ Білгір".
```

---

## Экран 1 — Главная / Курс

```
Home screen ("Курс" tab active). Top hero card with subtle ornament border:
greeting "Сәлеметсіз бе! 👋", short course description, and a row of stat
chips: "🔥 5 дней" (streak), "🎯 сегодня 7/10" (daily goal), "🔁 повторить 12"
(due reviews), "⭐ 340 XP". Below chips a thin gold-turquoise progress bar for
the daily goal, and a prominent turquoise CTA button "Повторить сегодня: 12 фраз →".

Below the hero: three module sections. Each module has a header card with a
roman numeral badge (I, II, III), Kazakh title + Russian subtitle
("АДАМ · Человек" in turquoise, "ХАЛЫҚ · Народ" in gold, "МӘДЕНИЕТ · Культура"
in violet) and completion counter like "3/7". Under each header, a vertical
list of lesson cards: number or checkmark icon, Kazakh lesson title
("Танысу"), Russian subtitle ("Знакомство"), phrase count "5 фраз →".
Locked lessons are dimmed with a lock icon 🔒 and caption "сдай предыдущий".
Completed lessons show a turquoise checkmark.
```

## Экран 2 — Урок

```
Lesson detail screen. Back link "← К списку уроков". Breadcrumb
"Урок 1 · АДАМ" in module color, big lesson title "Танысу" with subtitle
"Знакомство". A 16:9 video player card (thumbnail with play button) framed by
a thin ornament line. Section "Ситуативные фразы": list of phrase cards, each
with a large bold Kazakh phrase ("Танысып қоялық, менің атым..."), Russian
translation below ("Давайте познакомимся, меня зовут..."), italic
transcription in turquoise "[танысып коялык...]" and a small speaker icon 🔊.

Bottom action row: secondary button "💬 Диалог" and primary turquoise button
"✍️ Сдать урок". Small muted caption underneath: "Изучи фразы, пройди диалог
и сдай мини-экзамен, чтобы открыть следующий урок".
```

## Экран 3 — Экзамен урока

```
Lesson exam screen. Back link "← К уроку". Progress caption "Экзамен · вопрос
3 из 5 · верно: 2". Small uppercase label of question type "Собери фразу из слов".
Russian prompt phrase in the center ("Рад с вами познакомиться").
A dashed drop-zone card where chosen word-chips line up, below it a word bank
of shuffled Kazakh word chips ("қуаныштымын", "Сізбен", "танысқаныма") —
rounded rectangles that can be tapped. Some chips already used (dimmed).
Encouraging state colors: correct assembly glows turquoise/green, wrong glows red.

Also design a result variant: big 🎉 emoji, huge gold score "5 / 5",
message "Урок «Танысу» сдан! Следующий урок открыт." and a primary button
"Урок 2: Отбасы →" plus confetti particles falling.
```

## Экран 4 — Диалог-сценка (чат)

```
Chat-style dialogue screen "💬 Диалог · Знакомство". Back link "← К уроку".
Intro card with scenario description: "Ты на встрече. К тебе подходит
Айгүль — познакомься с ней." Chat bubbles: incoming bubbles on the left
(dark card style) with a Kazakh line "Сәлеметсіз бе! Танысып қоялық, менің
атым Айгүль." and a small muted Russian translation below it; user replies
on the right in translucent turquoise bubbles. Below the chat: section
"Твой ответ:" with three tappable answer option cards, each showing the
Kazakh phrase and a smaller Russian hint. One option may be shown in a red
error state with caption "Не то — собеседник тебя не понял".

Also a completion variant: 🎉, headline "Диалог пройден!", subtitle
"Ты справился со сценкой «Знакомство»", turquoise button "Вернуться к уроку".
```

## Экран 5 — Практика (карточки SRS)

```
Flashcard practice screen ("Практика" tab active). Caption "Карточка 4 / 16 ·
повторение: 12 · новых: 4". A large centered flashcard with subtle ornament
corners: big bold Kazakh phrase "Сіз қайдансыз?", turquoise italic
transcription "[сиз кайдансыз] 🔊", muted hint "Нажми, чтобы увидеть перевод".
Below the card two equal buttons: red-tinted "Не знаю" and green "Знаю ✓".
Tiny caption under buttons: "«Знаю» — фраза вернётся позже (1 → 3 → 7 → 21
день). «Не знаю» — повторим сегодня."

Also a session-complete variant: ✅, "Сессия завершена", stats line
"16 фраз: знал 12, повторим ещё 4", button "Продолжить практику".
```

## Экран 6 — Квиз

```
Quiz screen ("Квиз" tab active). Caption "Вопрос 4 из 10 · очки: 3".
Uppercase question-type label "Аудирование: послушай и выбери".
A big round speaker button 🔊 in the center (glowing turquoise ring),
caption "нажми, чтобы прослушать ещё раз". Four full-width answer cards
with Russian options; one highlighted green (correct) and one red (wrong
pick) to show answer states. Design should feel game-like but calm.
```

## Экран 7 — Прогресс

```
Progress screen ("Прогресс" tab active). Level card with ornament border:
"⭐ Білгір · знаток · уровень 3", subtitle "440 XP — до звания «Сөйлеуші»
ещё 460 XP", gold-turquoise progress bar. Grid of stat cards (2–3 per row):
"🔥 5 дней подряд", "7/10 фраз сегодня", "23 фраз выучено", "85 фраз в
работе", "12 к повторению", "6 уроков пройдено", "30% курса", "9 квизов",
"8/10 лучший результат".

Section "Достижения · 5/14": a 2-column grid of achievement badges — earned
ones bright with 🏆 and gold border ("Алғашқы қадам · первый урок сдан",
"🔥 3 дня подряд"), locked ones dimmed with 🔒 ("Весь курс пройден!",
"🔥 Месяц! Нағыз батыр"). Bottom motivational card "Так держать! 🚀" with
course progress bar.
```

---

## Примечания для дизайнера

Орнамент — деликатно: тонкие линии, уголки карточек, разделители; не ковёр.
Казахский текст всегда крупнее русского перевода. Проверить шрифт на буквы
ә, ғ, қ, ң, ө, ұ, ү, һ, і. Тёмная тема — основная (приложение живёт в
Telegram); светлую можно предложить как вариант. Анимации в приложении уже
есть: конфетти, тряска неверного ответа, пульс верного — в макетах достаточно
статичных состояний (обычное / верно / неверно / заблокировано).
