# sitkaz.kz — бриф «Мягкий ирбис» (светлый, округлый, барс-маскот)

Как пользоваться: для каждого экрана вставляй в Stitch три блока подряд:
**СТИЛЬ** + **ПРАВИЛА ТЕКСТА** + промпт нужного экрана.

---

## БЛОК 1 — СТИЛЬ (вставлять всегда первым)

```
Design a mobile screen for "sitkaz.kz" — a Telegram Mini App for learning
conversational Kazakh (lessons, flashcards, quizzes, chat dialogues, XP levels).

Visual style: bright, sunlit alpine theme where the SNOW LEOPARD (ирбис) and
the TIEN SHAN MOUNTAINS are the visual heroes — and every shape is SOFT and
ROUNDED: zero straight corners, zero sharp angles. Mountains are gentle
overlapping rounded domes and snow hills (billowy watercolor silhouettes in
pale blues). Cards are pebble-shaped super-elliptical containers (28–40px
radii) like smooth river stones on snow. Buttons are full pills; chips are
round snowballs; lesson markers are perfect circles.

The snow leopard is a true MASCOT with personality: soft rounded line-art
with thick friendly strokes (slate-blue lines, cream fill, amber eyes),
drawn BIG. He holds counters, climbs the course path over rounded hills,
leaps on success screens, naps curled into a circle on empty states; his
round paw prints mark completed items; his soft rosette spots are the
background pattern and progress-ring texture.

Learning metaphor: the course is a mountain ascent — lessons are round
base-camp badges on a winding dotted path up snowy hills to a summit flag;
XP shown as altitude; the daily goal is a circular progress ring around the
leopard's round medallion portrait.

Palette: snow white (#FDFEFF) with ice tints (#EAF2F9, #D6E6F2), sky
gradient (#BFDCF0 → white) behind hills, slate-blue text and line-art
(#33475C), warm amber (#F2953C) as the ONLY hot accent — CTAs, flags,
leopard eyes; soft smoke-gray (#A9BBCB) secondary; success uses amber, error
uses soft coral (#E8887C). High-key, airy, sunny; dark surfaces forbidden.

Typography: rounded friendly bold sans (like Nunito / Quicksand) everywhere —
Kazakh phrases biggest and softest; round numerals inside circular counters.
Mood: warm courage — a gentle giant of the mountains teaches you Kazakh.
Bottom navigation: a floating pill dock with four round icon bubbles, active
bubble amber with a tiny paw print. Mobile 390×844.
```

## БЛОК 2 — ПРАВИЛА ТЕКСТА (вставлять вторым)

```
⚠️ TEXT RULES — STRICT: every visible word must be RUSSIAN or KAZAKH only.
NO English anywhere (no "Home", "Lesson", "Level", "Start", no lorem ipsum,
no invented words). Use ONLY the exact strings from the COPY LIST of this
screen. Kazakh glyphs must render correctly: ә, ғ, қ, ң, ө, ұ, ү, һ, і.
Bottom navigation tabs are always: "Курс", "Практика", "Квиз", "Прогресс".
Header level pill is always: "⭐ Білгір".
```

---

## Экран 1 — Главная / Курс

```
Home screen ("Курс" tab active). Top: the hero area with a soft watercolor
backdrop of rounded snow hills and sky; the snow leopard mascot sits beside
a pebble-shaped greeting card and holds the streak counter in his paw.
The daily goal is a circular progress ring around the leopard's round
medallion portrait. A row of round chips, then a pill CTA button.
Below: the course as a winding dotted ascent path over rounded hills —
lessons are round base-camp badges on the path, grouped into three module
sections with soft banner headers. Completed camps show a round paw print,
locked camps are pale with a sleeping-cub icon and caption.

COPY LIST:
- Greeting: "Сәлеметсіз бе! 👋"
- Subtitle: "Разговорный казахский: 3 модуля, 20 уроков"
- Chips: "🔥 5 дней", "🎯 сегодня 7/10", "🔁 повторить 12", "⛰ 340 м"
- Ring label: "Цель дня"
- CTA: "Повторить сегодня: 12 фраз →"
- Modules: "I · АДАМ · Человек" (3/7), "II · ХАЛЫҚ · Народ" (0/10),
  "III · МӘДЕНИЕТ · Культура" (0/8)
- Lessons: "Танысу — Знакомство · 5 фраз →", "Отбасы — Семья · 5 фраз →",
  "Туыстық атаулар — Родственники · 5 фраз →"
- Locked caption: "сдай предыдущий"
```

## Экран 2 — Урок

```
Lesson detail screen. Top: back link and a soft breadcrumb. A rounded
video-player pebble with a big circular play button, framed by snow-hill
illustration; a tiny leopard peeks from behind the player's corner.
Section of phrase cards: each is a smooth pebble with a big bold Kazakh
phrase, smaller Russian translation, italic transcription and a round
speaker bubble button. Bottom: two pill buttons and a hint caption.

COPY LIST:
- Back: "← К списку уроков"
- Breadcrumb: "Урок 1 · АДАМ"
- Title: "Танысу", subtitle "Знакомство"
- Video placeholder: "Видео-лекция скоро появится"
- Section: "Ситуативные фразы"
- Phrases: "Танысып қоялық, менің атым..." / "Давайте познакомимся, меня
  зовут..." / "[танысып коялык]"; "Сіз қайдансыз?" / "Вы откуда?" /
  "[сиз кайдансыз]"; "Немен айналысасыз?" / "Чем вы занимаетесь?" /
  "[немен айналысасыз]"
- Buttons: "💬 Диалог", "✍️ Сдать урок"
- Hint: "Изучи фразы, пройди диалог и сдай мини-экзамен, чтобы открыть
  следующий урок"
```

## Экран 3 — Экзамен урока («собери фразу»)

```
Lesson exam screen. Top: back link and a round progress capsule. Question
type label, the Russian prompt phrase large in the center. A soft cloud-
shaped drop zone (rounded dashed pebble) where chosen word-bubbles line up;
below, a bank of round word-bubbles like snowballs; used ones are pale.
The leopard watches attentively from the bottom corner, tail curled.

COPY LIST:
- Back: "← К уроку"
- Progress: "Экзамен · вопрос 3 из 5 · верно: 2"
- Type label: "Собери фразу из слов"
- Prompt: "Рад с вами познакомиться"
- Word bubbles: "Сізбен", "танысқаныма", "қуаныштымын"
- Drop-zone hint: "Нажимай на слова по порядку"
```

## Экран 3b — Результат экзамена

```
Exam result screen: the leopard LEAPS in a joyful arc across rounded hills,
soft confetti snowflakes falling. Big amber score inside a circular badge
with paw-print texture, message lines, one pill CTA. A round path indicator
shows the next camp unlocking on the hill.

COPY LIST:
- Label: "Результат экзамена"
- Score: "5 / 5"
- Message: "Керемет! Урок «Танысу» сдан!"
- Submessage: "Следующий лагерь открыт. Подъём продолжается!"
- CTA: "Урок 2: Отбасы →"
```

## Экран 4 — Диалог-сценка (чат)

```
Chat dialogue screen. Top: back link and title. An intro pebble card with
the scenario. Chat: incoming bubbles are white pebbles on the left with the
leopard's round avatar; user replies are amber-tinted pebbles on the right.
Below: "Твой ответ:" and three round answer cards, one shown in soft coral
error state with a caption. All bubbles fully rounded.

COPY LIST:
- Back: "← К уроку"
- Title: "💬 Диалог · Знакомство"
- Intro: "Ты на встрече. К тебе подходит Айгүль — познакомься с ней."
- Incoming: "Сәлеметсіз бе! Танысып қоялық, менің атым Айгүль." /
  "Здравствуйте! Давайте познакомимся, меня зовут Айгуль."
- User reply: "Сәлеметсіз бе! Менің атым Олег." / "Здравствуйте! Меня зовут
  Олег."
- Answer section: "Твой ответ:"
- Options: "Мен Алматыданмын." / "Я из Алматы."; "Менің екі балам бар." /
  "У меня двое детей."; "Сау болыңыз!" / "До свидания!"
- Error caption: "Не то — собеседник тебя не понял"
```

## Экран 4b — Диалог пройден

```
Dialogue complete screen: the leopard and a friendly companion cub sit by a
round campfire under a soft evening-blue (but still light) sky with big
round stars. Celebration headline, reward pebble showing altitude gained
with a circular progress ring, one pill CTA.

COPY LIST:
- Headline: "Диалог пройден!"
- Subtitle: "Ты справился со сценкой «Знакомство»"
- Reward: "+30 м высоты"
- Ring label: "До нового звания: 460 м"
- CTA: "Вернуться к уроку"
```

## Экран 5 — Практика (карточки)

```
Flashcard practice screen ("Практика" tab active). Top: round session
capsule with counters. Center: one big pebble flashcard with soft paw-print
watermark, big Kazakh phrase, transcription with a round speaker bubble,
and a pulsing hint pill. The leopard hangs his paws over the top edge of
the card, looking at the user. Below: two pill buttons (coral and amber)
and a small SRS explanation line.

COPY LIST:
- Session: "Карточка 4 / 16 · повторение: 12 · новых: 4"
- Phrase: "Сіз қайдансыз?" / "[сиз кайдансыз]"
- Hint: "Нажми, чтобы увидеть перевод"
- Buttons: "Не знаю", "Знаю ✓"
- Explanation: "«Знаю» — фраза вернётся позже (1 → 3 → 7 → 21 день).
  «Не знаю» — повторим сегодня."
```

## Экран 5b — Сессия завершена

```
Practice session complete: the leopard naps curled into a perfect circle on
a round snow mound, one ear up, gentle "zzz" bubbles. Round summary badge,
stats line, one pill CTA.

COPY LIST:
- Headline: "Сессия завершена"
- Stats: "16 фраз: знал 12, повторим ещё 4"
- CTA: "Продолжить практику"
```

## Экран 6 — Квиз (аудирование)

```
Quiz screen ("Квиз" tab active). Top: round progress capsule and question
type label. Center: a big circular listen button — the leopard's round face
with headphones, amber glow ring pulsing around it; caption below. Then four
round answer pills stacked; one in correct amber state with a paw print,
one in soft coral wrong state.

COPY LIST:
- Progress: "Вопрос 4 из 10 · очки: 3"
- Type label: "Аудирование: послушай и выбери"
- Caption: "нажми, чтобы прослушать ещё раз"
- Options: "Добрый день" (correct), "Доброе утро", "Добрый вечер" (wrong),
  "Спокойной ночи"
```

## Экран 7 — Прогресс

```
Progress screen ("Прогресс" tab active). Top: a big level card — circular
leopard medallion portrait with an altitude progress ring around it, rank
title and altitude numbers. Then a soft grid of round stat pebbles (3 per
row). Achievements: a 2-column grid of round felt-like medallions — earned
ones bright with a paw print, locked ones pale with a sleeping cub. Bottom:
a motivation pebble with a small hill-path illustration showing the summit
flag ahead.

COPY LIST:
- Level card: "⭐ Білгір · знаток · уровень 3", "Высота 440 м — до звания
  «Сөйлеуші» ещё 460 м"
- Stats: "🔥 5 дней подряд", "7/10 фраз сегодня", "23 выучено",
  "85 в работе", "12 к повторению", "6 уроков", "30% курса", "9 квизов",
  "8/10 лучший"
- Achievements header: "Достижения · 5/14"
- Earned: "Алғашқы қадам — первый урок сдан", "🔥 3 дня подряд"
- Locked: "Весь курс пройден", "🔥 Месяц! Нағыз батыр"
- Motivation: "Так держать! 🚀 Вершина всё ближе."
```

---

Когда сгенерируешь экраны — присылай код сюда по одному, сохраню в
`design/irbis/` и перенесу стиль в приложение.
