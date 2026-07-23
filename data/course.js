// Структура курса «Ситуативный казахский» (методика К. Тасибекова).
// 3 модуля, 20 уроков. Суть методики — готовые ситуативные ФРАЗЫ, а не сухая грамматика.
//
// Поля фразы: kk (казахский), ru (русский перевод), en (английский перевод), tr (произношение).
// Язык перевода (ru/en) выбирается пользователем в интерфейсе.

export const modules = [
  {
    id: "adam",
    num: "I",
    title: "АДАМ",
    subtitle: "Человек", subtitleEn: "The Person",
    color: "#F2953C",
    desc: "Семья, родственники, род и жуз, характер и облик человека.",
    descEn: "Family, relatives, clan and zhuz, character and appearance.",
  },
  {
    id: "halyq",
    num: "II",
    title: "ХАЛЫҚ",
    subtitle: "Народ", subtitleEn: "The People",
    color: "#7FA8C9",
    desc: "Национальный характер, взгляды и ценности, страна, история, общество.",
    descEn: "National character, values, the country, history and society.",
  },
  {
    id: "madeniet",
    num: "III",
    title: "МӘДЕНИЕТ",
    subtitle: "Культура", subtitleEn: "Culture",
    color: "#A9BBCB",
    desc: "Этикет, обычаи и традиции, праздники, гостеприимство, искусство.",
    descEn: "Etiquette, customs and traditions, holidays, hospitality, art.",
  },
];

export const lessons = [
  // ── Модуль I. АДАМ ───────────────────────────────
  {
    id: 1, module: "adam", title: "Танысу", ru: "Знакомство", en: "Getting Acquainted", video: null,
    phrases: [
      { kk: "Танысып қоялық, менің атым...", ru: "Давайте познакомимся, меня зовут...", en: "Let's get acquainted, my name is...", tr: "танысып коялык, мениң атым" },
      { kk: "Сізбен танысқаныма қуаныштымын", ru: "Рад с вами познакомиться", en: "Nice to meet you", tr: "сизбен танысканыма куаныштымын" },
      { kk: "Сіз қайдансыз?", ru: "Вы откуда?", en: "Where are you from?", tr: "сиз кайдансыз" },
      { kk: "Немен айналысасыз?", ru: "Чем вы занимаетесь?", en: "What do you do?", tr: "немен айналысасыз" },
      { kk: "Кездескенше сау болыңыз", ru: "До встречи, всего доброго", en: "See you, all the best", tr: "кездескенше сау болыңыз" },
    ],
  },
  {
    id: 2, module: "adam", title: "Отбасы", ru: "Семья", en: "Family", video: null,
    phrases: [
      { kk: "Менің отбасым үлкен", ru: "У меня большая семья", en: "I have a big family", tr: "мениң отбасым улкен" },
      { kk: "Отбасыңызда неше адам бар?", ru: "Сколько человек в вашей семье?", en: "How many people are in your family?", tr: "отбасыңызда неше адам бар" },
      { kk: "Балаларыңыз бар ма?", ru: "У вас есть дети?", en: "Do you have children?", tr: "балаларыңыз бар ма" },
      { kk: "Менің екі балам бар", ru: "У меня двое детей", en: "I have two children", tr: "мениң еки балам бар" },
      { kk: "Отбасы — ең маңызды нәрсе", ru: "Семья — самое важное", en: "Family is the most important thing", tr: "отбасы — ең маңызды нәрсе" },
    ],
  },
  {
    id: 3, module: "adam", title: "Туыстық атаулар", ru: "Родственники", en: "Relatives", video: null,
    phrases: [
      { kk: "Бұл менің ағам", ru: "Это мой старший брат", en: "This is my older brother", tr: "бул мениң агам" },
      { kk: "Ол менің әпкем", ru: "Она моя старшая сестра", en: "She is my older sister", tr: "ол мениң әпкем" },
      { kk: "Атам мен әжем ауылда тұрады", ru: "Дедушка и бабушка живут в ауле", en: "My grandfather and grandmother live in the village", tr: "атам мен әжем ауылда турады" },
      { kk: "Нағашым бізге келді", ru: "Дядя (по матери) приехал к нам", en: "My maternal uncle came to visit us", tr: "нагашым бизге келди" },
      { kk: "Біз жақын туыспыз", ru: "Мы близкие родственники", en: "We are close relatives", tr: "биз жакын туыспыз" },
    ],
  },
  {
    id: 4, module: "adam", title: "Ру мен жүз", ru: "Род и жуз", en: "Clan and Zhuz", video: null,
    phrases: [
      { kk: "Сіз қай рудансыз?", ru: "Вы из какого рода?", en: "Which clan are you from?", tr: "сиз кай рудансыз" },
      { kk: "Жеті атаңды білу — парыз", ru: "Знать семь предков — долг", en: "Knowing your seven ancestors is a duty", tr: "жети атаңды билу — парыз" },
      { kk: "Қазақта үш жүз бар", ru: "У казахов три жуза", en: "The Kazakhs have three zhuzes", tr: "казакта уш жуз бар" },
      { kk: "Менің руым...", ru: "Мой род...", en: "My clan is...", tr: "мениң руым" },
    ],
  },
  {
    id: 5, module: "adam", title: "Адамның мінезі", ru: "Характер человека", en: "Character", video: null,
    phrases: [
      { kk: "Ол өте мейірімді адам", ru: "Он очень добрый человек", en: "He is a very kind person", tr: "ол оте мейиримди адам" },
      { kk: "Ол — ашық мінезді", ru: "Он открытого характера", en: "He has an open personality", tr: "ол — ашык минезди" },
      { kk: "Ол сабырлы кісі", ru: "Он спокойный человек", en: "He is a calm person", tr: "ол сабырлы киси" },
      { kk: "Мінезі жақсы адаммен жұмыс істеу оңай", ru: "С человеком доброго нрава легко работать", en: "It's easy to work with a good-natured person", tr: "минези жаксы адаммен жумыс истеу оңай" },
    ],
  },
  {
    id: 6, module: "adam", title: "Сыртқы келбет", ru: "Внешность", en: "Appearance", video: null,
    phrases: [
      { kk: "Ол ұзын бойлы", ru: "Он высокого роста", en: "He is tall", tr: "ол узын бойлы" },
      { kk: "Оның шашы қара", ru: "У неё чёрные волосы", en: "She has black hair", tr: "оның шашы кара" },
      { kk: "Ол әдемі киінеді", ru: "Она красиво одевается", en: "She dresses beautifully", tr: "ол әдеми кииненеди" },
      { kk: "Сен бүгін өте жарасымдысың", ru: "Ты сегодня отлично выглядишь", en: "You look great today", tr: "сен бугин оте жарасымдысың" },
    ],
  },
  {
    id: 7, module: "adam", title: "Күнделікті өмір", ru: "Повседневная жизнь", en: "Daily Life", video: null,
    phrases: [
      { kk: "Мен таңертең ерте тұрамын", ru: "Я встаю рано утром", en: "I get up early in the morning", tr: "мен таңертең ерте турамын" },
      { kk: "Жұмысқа қалай барасыз?", ru: "Как вы добираетесь до работы?", en: "How do you get to work?", tr: "жумыска калай барасыз" },
      { kk: "Кешке демаламын", ru: "Вечером я отдыхаю", en: "In the evening I rest", tr: "кешке демаламын" },
      { kk: "Бүгін не істейміз?", ru: "Что делаем сегодня?", en: "What are we doing today?", tr: "бугин не истейміз" },
    ],
  },

  // ── Модуль II. ХАЛЫҚ ─────────────────────────────
  {
    id: 8, module: "halyq", title: "Ұлттық мінез", ru: "Национальный характер", en: "National Character", video: null,
    phrases: [
      { kk: "Қазақ халқы қонақжай", ru: "Казахский народ гостеприимный", en: "The Kazakh people are hospitable", tr: "казак халкы конакжай" },
      { kk: "Ел бірлікте — күшті", ru: "Народ силён в единстве", en: "A nation is strong in unity", tr: "ел бирликте — кушти" },
      { kk: "Үлкенді сыйлау — дәстүр", ru: "Уважать старших — традиция", en: "Respecting elders is a tradition", tr: "улкенди сыйлау — дәстур" },
    ],
  },
  {
    id: 9, module: "halyq", title: "Көзқарас пен құндылық", ru: "Взгляды и ценности", en: "Views and Values", video: null,
    phrases: [
      { kk: "Ар-намыс — ең жоғары құндылық", ru: "Честь — высшая ценность", en: "Honor is the highest value", tr: "ар-намыс — ең жогары кундылык" },
      { kk: "Мен осылай ойлаймын", ru: "Я думаю так", en: "This is what I think", tr: "мен осылай ойлаймын" },
      { kk: "Сіздің пікіріңіз қандай?", ru: "Каково ваше мнение?", en: "What is your opinion?", tr: "сиздиң пикириңиз кандай" },
    ],
  },
  {
    id: 10, module: "halyq", title: "Ел мен жер", ru: "Страна и земля", en: "Country and Land", video: null,
    phrases: [
      { kk: "Қазақстан — менің Отаным", ru: "Казахстан — моя Родина", en: "Kazakhstan is my homeland", tr: "казакстан — мениң отаным" },
      { kk: "Біздің жеріміз кең-байтақ", ru: "Наша земля обширна", en: "Our land is vast", tr: "биздиң жеримиз кең-байтак" },
      { kk: "Сіз қай қаладансыз?", ru: "Вы из какого города?", en: "Which city are you from?", tr: "сиз кай каладансыз" },
    ],
  },
  {
    id: 11, module: "halyq", title: "Тарих", ru: "История", en: "History", video: null,
    phrases: [
      { kk: "Тарихты білу — маңызды", ru: "Знать историю — важно", en: "Knowing history is important", tr: "тарихты билу — маңызды" },
      { kk: "Ата-бабамыз батыр болған", ru: "Наши предки были героями", en: "Our ancestors were heroes", tr: "ата-бабамыз батыр болган" },
      { kk: "Бұл — тарихи оқиға", ru: "Это историческое событие", en: "This is a historic event", tr: "бул — тарихи окига" },
    ],
  },
  {
    id: 12, module: "halyq", title: "Мақал-мәтел", ru: "Пословицы и поговорки", en: "Proverbs and Sayings", video: null,
    phrases: [
      { kk: "Еңбек етсең — ерінбей, тояды қарның тіленбей", ru: "Будешь усердно трудиться — будешь сыт", en: "Work hard without laziness, and you will never go hungry", tr: "еңбек етсең еринбей..." },
      { kk: "Жеті рет өлшеп, бір рет кес", ru: "Семь раз отмерь, один раз отрежь", en: "Measure seven times, cut once", tr: "жети рет олшеп, бир рет кес" },
      { kk: "Бірлік болмай, тірлік болмас", ru: "Без единства нет благополучия", en: "Without unity there is no well-being", tr: "бирлик болмай, тирлик болмас" },
    ],
  },
  {
    id: 13, module: "halyq", title: "Ауа райы мен табиғат", ru: "Погода и природа", en: "Weather and Nature", video: null,
    phrases: [
      { kk: "Бүгін ауа райы жақсы", ru: "Сегодня хорошая погода", en: "The weather is good today", tr: "бугин ауа райы жаксы" },
      { kk: "Далада суық", ru: "На улице холодно", en: "It's cold outside", tr: "далада суык" },
      { kk: "Жаңбыр жауып тұр", ru: "Идёт дождь", en: "It is raining", tr: "жаңбыр жауып тур" },
    ],
  },
  {
    id: 14, module: "halyq", title: "Қоғам", ru: "Общество", en: "Society", video: null,
    phrases: [
      { kk: "Қоғамда әркімнің орны бар", ru: "В обществе у каждого своё место", en: "Everyone has a place in society", tr: "когамда әркимниң орны бар" },
      { kk: "Біз бір-бірімізге көмектесеміз", ru: "Мы помогаем друг другу", en: "We help each other", tr: "биз бир-биримизге комектесемиз" },
      { kk: "Жастар — болашақ", ru: "Молодёжь — будущее", en: "The youth are the future", tr: "жастар — болашак" },
    ],
  },

  // ── Модуль III. МӘДЕНИЕТ ─────────────────────────
  {
    id: 15, module: "madeniet", title: "Сәлемдесу этикеті", ru: "Этикет приветствия", en: "Greeting Etiquette", video: null,
    phrases: [
      { kk: "Ассалаумағалейкум!", ru: "Мир вам! (приветствие)", en: "Peace be upon you! (greeting)", tr: "ассалаумагалейкум" },
      { kk: "Уағалейкумассалам!", ru: "И вам мир! (ответ)", en: "And peace be upon you! (reply)", tr: "уагалейкумассалам" },
      { kk: "Амансыз ба?", ru: "Здравствуйте, как вы?", en: "Hello, how are you?", tr: "амансыз ба" },
      { kk: "Қош келдіңіз!", ru: "Добро пожаловать!", en: "Welcome!", tr: "кош келдиңиз" },
    ],
  },
  {
    id: 16, module: "madeniet", title: "Дастарқан дәстүрі", ru: "Традиции застолья", en: "Table Traditions", video: null,
    phrases: [
      { kk: "Дастарқанға қош келдіңіз", ru: "Добро пожаловать за стол", en: "Welcome to the table", tr: "дастарканга кош келдиңиз" },
      { kk: "Ас болсын!", ru: "Приятного аппетита!", en: "Enjoy your meal!", tr: "ас болсын" },
      { kk: "Дәм тартты", ru: "Судьба привела разделить трапезу", en: "Fate brought us to share this meal", tr: "дәм тартты" },
      { kk: "Рахмет, тойдым", ru: "Спасибо, я наелся", en: "Thank you, I'm full", tr: "рахмет, тойдым" },
    ],
  },
  {
    id: 17, module: "madeniet", title: "Салт-дәстүр", ru: "Обычаи и традиции", en: "Customs and Traditions", video: null,
    phrases: [
      { kk: "Бұл — ежелгі дәстүр", ru: "Это древняя традиция", en: "This is an ancient tradition", tr: "бул — ежелги дәстур" },
      { kk: "Салтымызды сақтаймыз", ru: "Мы храним наши обычаи", en: "We preserve our customs", tr: "салтымызды сактаймыз" },
      { kk: "Тұсаукесер тойы", ru: "Праздник первых шагов ребёнка", en: "The celebration of a child's first steps", tr: "тусаукесер тойы" },
    ],
  },
  {
    id: 18, module: "madeniet", title: "Ұлттық мерекелер", ru: "Национальные праздники", en: "National Holidays", video: null,
    phrases: [
      { kk: "Наурыз құтты болсын!", ru: "С праздником Наурыз!", en: "Happy Nauryz!", tr: "наурыз кутты болсын" },
      { kk: "Мерекеңіз құтты болсын!", ru: "С праздником вас!", en: "Happy holiday!", tr: "мерекеңиз кутты болсын" },
      { kk: "Бүгін — мереке күні", ru: "Сегодня праздничный день", en: "Today is a holiday", tr: "бугин — мереке куни" },
    ],
  },
  {
    id: 19, module: "madeniet", title: "Қонақжайлылық", ru: "Гостеприимство", en: "Hospitality", video: null,
    phrases: [
      { kk: "Қонақ келсе — құт келеді", ru: "Гость приходит — благодать приходит", en: "When a guest comes, blessing comes", tr: "конак келсе — кут келеди" },
      { kk: "Төрге шығыңыз", ru: "Проходите на почётное место", en: "Please take the seat of honor", tr: "торге шыгыңыз" },
      { kk: "Шай ішіп кетіңіз", ru: "Выпейте чаю прежде чем уйти", en: "Have some tea before you go", tr: "шай ишип кетиңиз" },
    ],
  },
  {
    id: 20, module: "madeniet", title: "Өнер мен музыка", ru: "Искусство и музыка", en: "Art and Music", video: null,
    phrases: [
      { kk: "Домбыра — ұлттық аспап", ru: "Домбра — национальный инструмент", en: "The dombra is a national instrument", tr: "домбыра — улттык аспап" },
      { kk: "Мен ән тыңдағанды жақсы көремін", ru: "Я люблю слушать песни", en: "I love listening to songs", tr: "мен ән тыңдаганды жаксы коремин" },
      { kk: "Бұл күй өте әдемі", ru: "Этот кюй очень красивый", en: "This kui (melody) is very beautiful", tr: "бул куй оте әдеми" },
    ],
  },
];

export function lessonsByModule(moduleId) {
  return lessons.filter((l) => l.module === moduleId);
}

// Все фразы одним массивом — для практики (карточки, квиз).
export const allPhrases = lessons.flatMap((l) =>
  l.phrases.map((p) => ({ ...p, lesson: l.title, lessonId: l.id }))
);
