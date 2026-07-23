// Курс «Ситуативный казахский» — структура по книге К. Тасибекова
// (14 глав → модули, подглавы → уроки). Тексты фраз и заметок — учебные
// формулировки: обычная лексика, простые ситуативные фразы, короткие
// культурные заметки. Термины родства — общая словарная лексика.
//
// Поле фразы: type (term|proverb|phrase|colloc), kk, ru, en, tr.
// Урок может иметь note: { ru, en } — короткую культурную заметку.

export const modules = [
  { id: "tek", num: "I", title: "ТЕК", subtitle: "Происхождение", subtitleEn: "Origin", color: "#F2953C",
    desc: "Род, жуз, семь предков — откуда идут корни казаха.", descEn: "Clan, zhuz and the seven ancestors — a Kazakh's roots." },
  { id: "uy", num: "II", title: "ҮЙ-ІШІ", subtitle: "Семья", subtitleEn: "Family", color: "#7FA8C9",
    desc: "Дедушки, родители, супруги и дети — ядро казахской семьи.", descEn: "Grandparents, parents, spouses and children." },
  { id: "tuys", num: "III", title: "ТУҒАН-ТУЫСҚАН", subtitle: "Родственники", subtitleEn: "Relatives", color: "#A9BBCB",
    desc: "Родня по отцу, по жене и по матери — три круга родства.", descEn: "Kin by father, by spouse and by mother." },
  { id: "minez", num: "IV", title: "МІНЕЗ", subtitle: "Характер", subtitleEn: "Character", color: "#93AE85",
    desc: "Черты казахского характера: добродушие, гостеприимство и другие.", descEn: "Traits of the Kazakh character." },
  { id: "mura", num: "V", title: "МҰРА", subtitle: "Наследие", subtitleEn: "Heritage", color: "#CE7B5B",
    desc: "Язык, Родина и единство — ценности, оставленные предками.", descEn: "Language, homeland and unity." },
  { id: "kozkaras", num: "VI", title: "КӨЗҚАРАС", subtitle: "Мировоззрение", subtitleEn: "Worldview", color: "#7FA8C9",
    desc: "Отношение к судьбе, вере, богатству и власти.", descEn: "Views on fate, faith, wealth and power." },
  { id: "jon", num: "VII", title: "ЖӨН БІЛУ", subtitle: "Этикет", subtitleEn: "Etiquette", color: "#A9BBCB",
    desc: "Обычаи, традиции и правила учтивости.", descEn: "Customs, traditions and courtesy." },
  { id: "uilenu", num: "VIII", title: "ҮЙЛЕНУ", subtitle: "Женитьба", subtitleEn: "Marriage", color: "#F2953C",
    desc: "Сватовство, проводы невесты и свадьба.", descEn: "Matchmaking, seeing off the bride and the wedding." },
  { id: "jerleu", num: "IX", title: "ЖЕРЛЕУ", subtitle: "Проводы", subtitleEn: "Farewell", color: "#8593A5",
    desc: "Слова соболезнования и поддержки в трудную минуту.", descEn: "Words of condolence and support." },
  { id: "bata", num: "X", title: "БАТА-ТІЛЕК", subtitle: "Пожелания", subtitleEn: "Blessings", color: "#F2953C",
    desc: "Благословения и добрые пожелания на разные случаи.", descEn: "Blessings and good wishes." },
  { id: "makal", num: "XI", title: "МАҚАЛ", subtitle: "Пословицы", subtitleEn: "Proverbs", color: "#93AE85",
    desc: "Народная мудрость в пословицах и поговорках.", descEn: "Folk wisdom in proverbs." },
  { id: "fraze", num: "XII", title: "ФРАЗЕОЛОГИЗМ", subtitle: "Фразеологизмы", subtitleEn: "Idioms", color: "#7FA8C9",
    desc: "Устойчивые выражения и их русские эквиваленты.", descEn: "Set expressions and their equivalents." },
  { id: "attar", num: "XIII", title: "АТТАР", subtitle: "Имена", subtitleEn: "Names", color: "#CE7B5B",
    desc: "Имена людей, топонимы и названия вокруг нас.", descEn: "Personal names, place names and terms." },
  { id: "ru", num: "XIV", title: "РУ СӨЗДЕРІ", subtitle: "Слова о родах", subtitleEn: "Clan Sayings", color: "#A9BBCB",
    desc: "Меткие, добродушные приговорки о родах.", descEn: "Witty, good-natured sayings about clans." },
];

export const lessons = [
  // ── I. ТЕК ─────────────────────────────
  { id: 1, module: "tek", title: "Жеті ата", ru: "Семь предков", en: "Seven Ancestors", video: null,
    note: {
      ru: "Казахи традиционно знают имена своих предков по мужской линии до седьмого колена — это считается признаком воспитанного человека. Поэтому рассказ о себе часто начинается с корней.",
      en: "Kazakhs traditionally know the names of their ancestors on the male line up to the seventh generation — a sign of a well-raised person. So talking about oneself often starts with one's roots.",
    },
    phrases: [
      { type: "term", kk: "Ата", ru: "дед; также предок, родоначальник", en: "grandfather; also an ancestor, forefather", tr: "ата" },
      { type: "term", kk: "Баба", ru: "прадед; далёкий предок", en: "great-grandfather; distant ancestor", tr: "баба" },
      { type: "phrase", kk: "Мен жеті атамды білемін", ru: "Я знаю своих семь предков", en: "I know my seven ancestors", tr: "мен жети атамды билемин" },
      { type: "phrase", kk: "Сіздің руыңыз қандай?", ru: "Из какого вы рода?", en: "Which clan are you from?", tr: "сиздиң руыңыз кандай" },
    ] },
  { id: 2, module: "tek", title: "Ата тегі", ru: "Свой род", en: "One's Clan", video: null,
    note: {
      ru: "У каждого казаха есть род (ру), входящий в один из трёх жузов. Вопрос о роде — обычная часть знакомства.",
      en: "Every Kazakh belongs to a clan (ru), part of one of the three zhuzes. Asking about clan is a normal part of getting acquainted.",
    },
    phrases: [
      { type: "term", kk: "Ру", ru: "род", en: "clan", tr: "ру" },
      { type: "term", kk: "Жүз", ru: "жуз — объединение родов", en: "zhuz — a union of clans", tr: "жуз" },
      { type: "phrase", kk: "Менің руым...", ru: "Мой род...", en: "My clan is...", tr: "мениң руым" },
      { type: "phrase", kk: "Қазақта үш жүз бар", ru: "У казахов три жуза", en: "The Kazakhs have three zhuzes", tr: "казакта уш жуз бар" },
    ] },

  // ── II. ҮЙ-ІШІ ─────────────────────────
  { id: 3, module: "uy", title: "Ата-әже", ru: "Дедушка и бабушка", en: "Grandparents", video: null,
    note: {
      ru: "Дедушки и бабушки играют большую роль в воспитании; внуков нередко любят сильнее собственных детей.",
      en: "Grandparents play a big role in upbringing; grandchildren are often loved even more than one's own children.",
    },
    phrases: [
      { type: "term", kk: "Ата", ru: "дедушка", en: "grandfather", tr: "ата" },
      { type: "term", kk: "Әже", ru: "бабушка", en: "grandmother", tr: "әже" },
      { type: "phrase", kk: "Атам мен әжем ауылда тұрады", ru: "Дедушка и бабушка живут в ауле", en: "My grandparents live in the village", tr: "атам мен әжем ауылда турады" },
      { type: "phrase", kk: "Немерелерін жақсы көреді", ru: "Он любит своих внуков", en: "He loves his grandchildren", tr: "немерелерин жаксы кореди" },
    ] },
  { id: 4, module: "uy", title: "Әке-шеше", ru: "Отец и мать", en: "Father and Mother", video: null,
    phrases: [
      { type: "term", kk: "Әке", ru: "отец", en: "father", tr: "әке" },
      { type: "term", kk: "Шеше / Ана", ru: "мать", en: "mother", tr: "шеше, ана" },
      { type: "phrase", kk: "Менің әкем дәрігер", ru: "Мой отец врач", en: "My father is a doctor", tr: "мениң әкем дәригер" },
      { type: "phrase", kk: "Анама көмектесемін", ru: "Я помогаю маме", en: "I help my mother", tr: "анама комектесемин" },
    ] },
  { id: 5, module: "uy", title: "Ерлі-зайыпты", ru: "Супруги", en: "Spouses", video: null,
    phrases: [
      { type: "term", kk: "Күйеу", ru: "муж", en: "husband", tr: "куйеу" },
      { type: "term", kk: "Әйел", ru: "жена", en: "wife", tr: "әйел" },
      { type: "phrase", kk: "Біз он жыл бірге тұрамыз", ru: "Мы живём вместе десять лет", en: "We've lived together for ten years", tr: "биз он жыл бирге турамыз" },
      { type: "proverb", kk: "Отбасы — ең маңызды нәрсе", ru: "Семья — самое важное", en: "Family is the most important thing", tr: "отбасы — ең маңызды нәрсе" },
    ] },
  { id: 6, module: "uy", title: "Ұл-қыз", ru: "Дети", en: "Children", video: null,
    phrases: [
      { type: "term", kk: "Ұл", ru: "сын", en: "son", tr: "ул" },
      { type: "term", kk: "Қыз", ru: "дочь", en: "daughter", tr: "кыз" },
      { type: "phrase", kk: "Менің екі балам бар", ru: "У меня двое детей", en: "I have two children", tr: "мениң еки балам бар" },
      { type: "phrase", kk: "Балаларыңыз бар ма?", ru: "У вас есть дети?", en: "Do you have children?", tr: "балаларыңыз бар ма" },
    ] },

  // ── III. ТУҒАН-ТУЫСҚАН ─────────────────
  { id: 7, module: "tuys", title: "Өз жұрт", ru: "Свои родичи", en: "Paternal Kin", video: null,
    note: {
      ru: "Ближе всех для казаха — родственники по прямой отцовской линии. Братьев различают по возрасту: аға — старший, іні — младший.",
      en: "Closest of all are relatives on the direct paternal line. Brothers are distinguished by age: aga — older, ini — younger.",
    },
    phrases: [
      { type: "term", kk: "Аға", ru: "старший брат", en: "older brother", tr: "ага" },
      { type: "term", kk: "Іні", ru: "младший брат", en: "younger brother", tr: "ини" },
      { type: "phrase", kk: "Бұл менің ағам", ru: "Это мой старший брат", en: "This is my older brother", tr: "бул мениң агам" },
      { type: "phrase", kk: "Біз жақын туыспыз", ru: "Мы близкие родственники", en: "We are close relatives", tr: "биз жакын туыспыз" },
    ] },
  { id: 8, module: "tuys", title: "Қайын жұрт", ru: "Родня жены и мужа", en: "In-laws", video: null,
    phrases: [
      { type: "term", kk: "Қайын ата", ru: "тесть; свёкор", en: "father-in-law", tr: "кайын ата" },
      { type: "term", kk: "Балдыз", ru: "младший брат/сестра жены", en: "wife's younger sibling", tr: "балдыз" },
      { type: "phrase", kk: "Қайын жұртыма барамын", ru: "Еду к родне жены", en: "I'm going to my wife's relatives", tr: "кайын журтыма барамын" },
      { type: "phrase", kk: "Келін болып түстім", ru: "Я вошла невесткой в семью", en: "I came into the family as a daughter-in-law", tr: "келин болып тустим" },
    ] },
  { id: 9, module: "tuys", title: "Нағашы жұрт", ru: "Родня матери", en: "Maternal Kin", video: null,
    note: {
      ru: "Родня матери (нағашы) — самые тёплые и снисходительные родственники: к ним едут «поребячиться», у них берут «как своё».",
      en: "The mother's kin (nagashy) are the warmest, most indulgent relatives — the ones you visit to be spoiled.",
    },
    phrases: [
      { type: "term", kk: "Нағашы", ru: "родственник по матери", en: "relative on the mother's side", tr: "нагашы" },
      { type: "term", kk: "Жиен", ru: "племянник (сын сестры или дочери)", en: "nephew (son of a sister or daughter)", tr: "жиен" },
      { type: "phrase", kk: "Нағашыма барамын", ru: "Еду к родне матери", en: "I'm going to my mother's relatives", tr: "нагашыма барамын" },
      { type: "phrase", kk: "Ол менің жиенім", ru: "Он мой племянник (по женской линии)", en: "He is my nephew (female line)", tr: "ол мениң жиеним" },
    ] },

  // ── IV. МІНЕЗ ──────────────────────────
  { id: 10, module: "minez", title: "Жылқы мінезді", ru: "Своенравный", en: "Free-spirited", video: null,
    note: {
      ru: "Казахи сравнивают свой характер с конём: свободолюбивый и работящий, но чувствительный к обиде — душу (көңіл) легко задеть.",
      en: "Kazakhs compare their character to a horse: freedom-loving and hardworking, but sensitive to offence — the soul (koñil) is easily hurt.",
    },
    phrases: [
      { type: "term", kk: "Мінез", ru: "характер, нрав", en: "character, temperament", tr: "минез" },
      { type: "term", kk: "Көңіл", ru: "душа, настроение", en: "soul, mood", tr: "коңил" },
      { type: "phrase", kk: "Ол қайсар адам", ru: "Он упрямый человек", en: "He is a stubborn person", tr: "ол кайсар адам" },
      { type: "phrase", kk: "Көңіліне тиме", ru: "Не задень его (не обижай)", en: "Don't hurt his feelings", tr: "коңилине тиме" },
    ] },
  { id: 11, module: "minez", title: "Аққөңіл", ru: "Добродушный", en: "Good-natured", video: null,
    phrases: [
      { type: "term", kk: "Аққөңіл", ru: "добродушный, открытый", en: "good-natured, open-hearted", tr: "аккоңил" },
      { type: "phrase", kk: "Ол өте мейірімді", ru: "Он очень добрый", en: "He is very kind", tr: "ол оте мейиримди" },
      { type: "proverb", kk: "Жақсылық жерде қалмайды", ru: "Добро не пропадёт даром", en: "Kindness is never lost", tr: "жаксылык жерде калмайды" },
    ] },
  { id: 12, module: "minez", title: "Қонақжай", ru: "Гостеприимный", en: "Hospitable", video: null,
    note: {
      ru: "Гостеприимство — главная черта казахов. Гостю рады всегда, для него всегда есть угощение, а лучшее место за столом — почётное (төр).",
      en: "Hospitality is the Kazakhs' main trait. A guest is always welcome, always fed, and offered the seat of honour (tör).",
    },
    phrases: [
      { type: "term", kk: "Қонақ", ru: "гость", en: "guest", tr: "конак" },
      { type: "proverb", kk: "Қонақ келсе — құт келеді", ru: "Гость приходит — благодать приходит", en: "When a guest comes, blessing comes", tr: "конак келсе — кут келеди" },
      { type: "phrase", kk: "Төрге шығыңыз", ru: "Проходите на почётное место", en: "Please take the seat of honour", tr: "торге шыгыңыз" },
    ] },
  { id: 13, module: "minez", title: "Ырымшыл", ru: "Суеверный", en: "Superstitious", video: null,
    phrases: [
      { type: "term", kk: "Ырым", ru: "примета, поверье", en: "omen, superstition", tr: "ырым" },
      { type: "phrase", kk: "Құдай қаласа", ru: "Если Бог даст", en: "God willing", tr: "кудай каласа" },
      { type: "phrase", kk: "Көз тимесін", ru: "Чтоб не сглазить", en: "May it not be jinxed", tr: "коз тимесин" },
    ] },
  { id: 14, module: "minez", title: "Білімді", ru: "Знающий", en: "Learned", video: null,
    phrases: [
      { type: "term", kk: "Білім", ru: "знание, образование", en: "knowledge, education", tr: "билим" },
      { type: "proverb", kk: "Оқу — білім бұлағы", ru: "Учёба — родник знаний", en: "Study is the spring of knowledge", tr: "оку — билим булагы" },
      { type: "phrase", kk: "Ол шетелде оқиды", ru: "Он учится за границей", en: "He studies abroad", tr: "ол шетелде окиды" },
    ] },
  { id: 15, module: "minez", title: "Сегіз қырлы", ru: "Многосторонний", en: "Versatile", video: null,
    note: {
      ru: "Идеал казаха — «сегіз қырлы, бір сырлы»: восьмигранный талант и постоянство. Настоящий джигит скромен и разносторонен.",
      en: "The Kazakh ideal is 'segiz qyrly, bir syrly' — eight-sided talent and steadfastness. A true man is modest and versatile.",
    },
    phrases: [
      { type: "term", kk: "Өнер", ru: "искусство, мастерство", en: "art, skill", tr: "онер" },
      { type: "phrase", kk: "Ол сегіз қырлы жігіт", ru: "Он разносторонний парень", en: "He is a versatile young man", tr: "ол сегиз кырлы жигит" },
      { type: "proverb", kk: "Ұлық болсаң, кішік бол", ru: "Если ты велик — будь скромен", en: "If you are great, be humble", tr: "улык болсаң, кишик бол" },
    ] },

  // ── V. МҰРА ────────────────────────────
  { id: 16, module: "mura", title: "Тіл", ru: "Язык", en: "Language", video: null,
    note: {
      ru: "Язык казахи ценят выше всего: «мы народ, следящий за словом». Красноречие и меткое слово всегда были в почёте.",
      en: "Kazakhs value language above all: 'we are a people who tend to the word'. Eloquence and a fitting word were always honoured.",
    },
    phrases: [
      { type: "term", kk: "Тіл", ru: "язык", en: "language", tr: "тил" },
      { type: "phrase", kk: "Қазақ тілі — менің ана тілім", ru: "Казахский — мой родной язык", en: "Kazakh is my native language", tr: "казак тили — мениң ана тилим" },
      { type: "proverb", kk: "Тіл — халықтың жаны", ru: "Язык — душа народа", en: "Language is the soul of a people", tr: "тил — халыктың жаны" },
    ] },
  { id: 17, module: "mura", title: "Ел", ru: "Родина", en: "Homeland", video: null,
    phrases: [
      { type: "term", kk: "Отан / Ел", ru: "Родина, страна", en: "homeland, country", tr: "отан, ел" },
      { type: "proverb", kk: "Туған жердей жер болмас", ru: "Нет земли лучше родной", en: "No land is better than one's own", tr: "туган жердей жер болмас" },
      { type: "phrase", kk: "Отан отбасынан басталады", ru: "Родина начинается с семьи", en: "The homeland begins with the family", tr: "отан отбасынан басталады" },
    ] },
  { id: 18, module: "mura", title: "Бірлік", ru: "Единство", en: "Unity", video: null,
    phrases: [
      { type: "term", kk: "Бірлік", ru: "единство", en: "unity", tr: "бирлик" },
      { type: "proverb", kk: "Бірлік болмай, тірлік болмас", ru: "Без единства нет благополучия", en: "Without unity there is no well-being", tr: "бирлик болмай, тирлик болмас" },
      { type: "proverb", kk: "Ынтымақ — ырыстың басы", ru: "Согласие — начало достатка", en: "Harmony is the start of prosperity", tr: "ынтымак — ырыстың басы" },
    ] },

  // ── VI. КӨЗҚАРАС ───────────────────────
  { id: 19, module: "kozkaras", title: "Жазған", ru: "Судьба", en: "Fate", video: null,
    note: {
      ru: "В характере казахов силён фатализм: считается, что каждому предначертана своя судьба. Отсюда обороты «если Бог даст».",
      en: "Fatalism is strong in the Kazakh character: each person is believed to have a destiny. Hence phrases like 'God willing'.",
    },
    phrases: [
      { type: "term", kk: "Тағдыр", ru: "судьба", en: "fate, destiny", tr: "тагдыр" },
      { type: "phrase", kk: "Әркімнің өз тағдыры бар", ru: "У каждого своя судьба", en: "Everyone has their own fate", tr: "әркимниң оз тагдыры бар" },
      { type: "proverb", kk: "Жазмыштан озмыш жоқ", ru: "Судьбы не избежать", en: "You cannot escape destiny", tr: "жазмыштан озмыш жок" },
    ] },
  { id: 20, module: "kozkaras", title: "Дін", ru: "Вера", en: "Faith", video: null,
    phrases: [
      { type: "term", kk: "Иман", ru: "вера", en: "faith", tr: "иман" },
      { type: "phrase", kk: "Құдайға шүкір", ru: "Слава Богу", en: "Thank God", tr: "кудайга шукир" },
      { type: "phrase", kk: "Аллаһ жазса", ru: "Если Аллах даст", en: "If Allah wills", tr: "аллаһ жазса" },
    ] },
  { id: 21, module: "kozkaras", title: "Мал", ru: "Богатство", en: "Wealth", video: null,
    note: {
      ru: "Богатство кочевника измерялось скотом (мал), но отношение к нему философски спокойное: главное богатство — здоровье.",
      en: "A nomad's wealth was measured in livestock (mal), yet the attitude to it is calm: the greatest wealth is health.",
    },
    phrases: [
      { type: "term", kk: "Мал", ru: "скот; богатство", en: "livestock; wealth", tr: "мал" },
      { type: "proverb", kk: "Бірінші байлық — денсаулық", ru: "Первое богатство — здоровье", en: "The first wealth is health", tr: "биринши байлык — денсаулык" },
      { type: "phrase", kk: "Барыңа шүкір ет", ru: "Будь благодарен за то, что есть", en: "Be thankful for what you have", tr: "барыңа шукир ет" },
    ] },
  { id: 22, module: "kozkaras", title: "Билік", ru: "Власть", en: "Power", video: null,
    phrases: [
      { type: "term", kk: "Билік", ru: "власть", en: "power, authority", tr: "билик" },
      { type: "phrase", kk: "Әділ би — халық үшін", ru: "Справедливый судья — за народ", en: "A fair judge serves the people", tr: "әдил би — халык ушин" },
      { type: "proverb", kk: "Балық басынан шіриді", ru: "Рыба гниёт с головы", en: "A fish rots from the head", tr: "балык басынан шириди" },
    ] },

  // ── VII. ЖӨН БІЛУ ──────────────────────
  { id: 23, module: "jon", title: "Салт-дәстүр", ru: "Обычаи и традиции", en: "Customs and Traditions", video: null,
    phrases: [
      { type: "term", kk: "Дәстүр", ru: "традиция", en: "tradition", tr: "дәстур" },
      { type: "phrase", kk: "Бұл — ежелгі дәстүр", ru: "Это древняя традиция", en: "This is an ancient tradition", tr: "бул — ежелги дәстур" },
      { type: "phrase", kk: "Салтымызды сақтаймыз", ru: "Мы храним наши обычаи", en: "We preserve our customs", tr: "салтымызды сактаймыз" },
    ] },
  { id: 24, module: "jon", title: "Әдептілік", ru: "Учтивость", en: "Courtesy", video: null,
    note: {
      ru: "Основа этикета — приветствие и уважение к старшим. Младший здоровается первым, старшему уступают почётное место.",
      en: "The basis of etiquette is greeting and respect for elders. The younger greets first; the elder is given the seat of honour.",
    },
    phrases: [
      { type: "term", kk: "Сәлем", ru: "приветствие", en: "greeting", tr: "сәлем" },
      { type: "phrase", kk: "Ассалаумағалейкум!", ru: "Мир вам! (приветствие)", en: "Peace be upon you! (greeting)", tr: "ассалаумагалейкум" },
      { type: "phrase", kk: "Үлкенді сыйла", ru: "Уважай старших", en: "Respect your elders", tr: "улкенди сыйла" },
      { type: "phrase", kk: "Қош келдіңіз!", ru: "Добро пожаловать!", en: "Welcome!", tr: "кош келдиңиз" },
    ] },

  // ── VIII. ҮЙЛЕНУ ───────────────────────
  { id: 25, module: "uilenu", title: "Құда түсу", ru: "Сватовство", en: "Matchmaking", video: null,
    note: {
      ru: "Свадьбе предшествует сватовство. Породнившиеся семьи становятся сватами (құда) — это уважительные, тёплые отношения на всю жизнь.",
      en: "A wedding is preceded by matchmaking. The joined families become matchmakers (quda) — a warm, respectful lifelong bond.",
    },
    phrases: [
      { type: "term", kk: "Құда", ru: "сват", en: "matchmaker, in-law", tr: "куда" },
      { type: "phrase", kk: "Құда болдық", ru: "Мы стали сватами", en: "We have become in-laws", tr: "куда болдык" },
      { type: "phrase", kk: "Қыз айттыру", ru: "Сватать девушку", en: "To ask for a girl's hand", tr: "кыз айттыру" },
    ] },
  { id: 26, module: "uilenu", title: "Қыз ұзату", ru: "Проводы невесты", en: "Seeing off the Bride", video: null,
    phrases: [
      { type: "term", kk: "Ұзату", ru: "проводы невесты", en: "seeing off the bride", tr: "узату" },
      { type: "phrase", kk: "Қызымызды ұзатамыз", ru: "Мы провожаем нашу дочь", en: "We are seeing off our daughter", tr: "кызымызды узатамыз" },
      { type: "phrase", kk: "Бақытты бол!", ru: "Будь счастлива!", en: "Be happy!", tr: "бакытты бол" },
    ] },
  { id: 27, module: "uilenu", title: "Келін түсіру", ru: "Свадьба", en: "Wedding", video: null,
    phrases: [
      { type: "term", kk: "Келін", ru: "невестка", en: "daughter-in-law", tr: "келин" },
      { type: "phrase", kk: "Келін түсірдік", ru: "Мы ввели невестку в дом", en: "We welcomed a daughter-in-law", tr: "келин тусирдик" },
      { type: "phrase", kk: "Той құтты болсын!", ru: "Поздравляем со свадьбой!", en: "Congratulations on the wedding!", tr: "той кутты болсын" },
    ] },
  { id: 28, module: "uilenu", title: "Құдалық", ru: "Визиты сватов", en: "Matchmakers' Visits", video: null,
    phrases: [
      { type: "term", kk: "Құдағи", ru: "сватья", en: "female in-law", tr: "кудаги" },
      { type: "phrase", kk: "Құдаларды күтеміз", ru: "Принимаем сватов", en: "We are hosting the in-laws", tr: "кудаларды кутемиз" },
      { type: "phrase", kk: "Құда-жекжат болдық", ru: "Мы породнились", en: "We have become related", tr: "куда-жекжат болдык" },
    ] },

  // ── IX. ЖЕРЛЕУ ─────────────────────────
  { id: 29, module: "jerleu", title: "Көңіл айту", ru: "Соболезнование", en: "Condolences", video: null,
    note: {
      ru: "В трудную минуту важно правильно поддержать словом. О тяжёлой вести сообщают бережно, а близким говорят слова утешения.",
      en: "In hard times the right word matters. Heavy news is shared gently, and the bereaved are offered words of comfort.",
    },
    phrases: [
      { type: "term", kk: "Қаза", ru: "кончина, утрата", en: "loss, passing", tr: "каза" },
      { type: "phrase", kk: "Қайғыңызға ортақпын", ru: "Разделяю ваше горе", en: "I share your grief", tr: "кайгыңызга ортакпын" },
      { type: "phrase", kk: "Сабыр беріңіз", ru: "Крепитесь (терпения вам)", en: "Stay strong (patience to you)", tr: "сабыр бериңиз" },
    ] },
  { id: 30, module: "jerleu", title: "Ас", ru: "Поминки", en: "Memorial Feast", video: null,
    phrases: [
      { type: "term", kk: "Ас", ru: "поминальный ас", en: "memorial feast", tr: "ас" },
      { type: "phrase", kk: "Иманды болсын", ru: "Пусть покоится с миром", en: "May they rest in peace", tr: "иманды болсын" },
      { type: "phrase", kk: "Артында ізгі іс қалды", ru: "После него осталось доброе дело", en: "A good deed remained after them", tr: "артында изги иш калды" },
    ] },

  // ── X. БАТА-ТІЛЕК ──────────────────────
  { id: 31, module: "bata", title: "Бата", ru: "Благословение", en: "Blessing", video: null,
    note: {
      ru: "Старшие дают младшим «бата» — благословение перед дорогой или важным делом. В ответ принято сказать «әумин».",
      en: "Elders give the young a 'bata' — a blessing before a journey or an important task. The reply is 'amin'.",
    },
    phrases: [
      { type: "term", kk: "Бата", ru: "благословение", en: "blessing", tr: "бата" },
      { type: "phrase", kk: "Бата беріңіз", ru: "Дайте благословение", en: "Please give your blessing", tr: "бата бериңиз" },
      { type: "phrase", kk: "Жолың болсын!", ru: "Счастливого пути!", en: "Have a good journey!", tr: "жолың болсын" },
    ] },
  { id: 32, module: "bata", title: "Тілек", ru: "Пожелания", en: "Wishes", video: null,
    phrases: [
      { type: "term", kk: "Тілек", ru: "пожелание", en: "wish", tr: "тилек" },
      { type: "phrase", kk: "Денсаулық тілеймін", ru: "Желаю здоровья", en: "I wish you health", tr: "денсаулык тилеймин" },
      { type: "phrase", kk: "Мереке құтты болсын!", ru: "С праздником!", en: "Happy holiday!", tr: "мереке кутты болсын" },
    ] },

  // ── XI. МАҚАЛ ──────────────────────────
  { id: 33, module: "makal", title: "Тура мақалдар", ru: "Прямые пословицы", en: "Direct Proverbs", video: null,
    note: {
      ru: "Часть казахских пословиц совпадает по смыслу и форме с русскими — их легко узнать и запомнить.",
      en: "Some Kazakh proverbs match Russian ones in both sense and form, making them easy to recognise.",
    },
    phrases: [
      { type: "proverb", kk: "Еңбек түбі — береке", ru: "В основе труда — достаток", en: "Labour is the root of plenty", tr: "еңбек туби — береке" },
      { type: "proverb", kk: "Жеті рет өлше, бір рет кес", ru: "Семь раз отмерь, один раз отрежь", en: "Measure seven times, cut once", tr: "жети рет олше, бир рет кес" },
    ] },
  { id: 34, module: "makal", title: "Мағыналы мақалдар", ru: "Смысловые пословицы", en: "Meaningful Proverbs", video: null,
    phrases: [
      { type: "proverb", kk: "Асыққан — шайтанның ісі", ru: "Спешка — от лукавого", en: "Haste is the devil's work", tr: "асыккан — шайтанның иши" },
      { type: "proverb", kk: "Сабыр түбі — сары алтын", ru: "Терпение — чистое золото", en: "Patience is pure gold", tr: "сабыр туби — сары алтын" },
    ] },
  { id: 35, module: "makal", title: "Аудармалы мақалдар", ru: "Переводные пословицы", en: "Translated Proverbs", video: null,
    phrases: [
      { type: "proverb", kk: "Көз қорқақ, қол батыр", ru: "Глаза боятся, руки делают", en: "The eyes fear, the hands do", tr: "коз коркак, кол батыр" },
      { type: "proverb", kk: "Досың көп болса, жолың кең", ru: "Больше друзей — шире дорога", en: "More friends, a wider road", tr: "досың коп болса, жолың кең" },
    ] },

  // ── XII. ФРАЗЕОЛОГИЗМ ──────────────────
  { id: 36, module: "fraze", title: "Тұрақты тіркестер", ru: "Устойчивые выражения", en: "Set Expressions", video: null,
    note: {
      ru: "Многие выражения строятся вокруг слова «көңіл» (душа, настроение) — это один из ключевых образов казахского языка.",
      en: "Many expressions are built around the word 'koñil' (soul, mood) — a key image of the Kazakh language.",
    },
    phrases: [
      { type: "colloc", kk: "Көңіл айту", ru: "выразить соболезнование", en: "to offer condolences", tr: "коңил айту" },
      { type: "colloc", kk: "Көңіл көтеру", ru: "поднять настроение", en: "to lift the mood", tr: "коңил котеру" },
      { type: "colloc", kk: "Бас қосу", ru: "собраться вместе", en: "to gather together", tr: "бас косу" },
    ] },
  { id: 37, module: "fraze", title: "Айтқыңыз келсе", ru: "Если хотите сказать", en: "If You Want to Say", video: null,
    phrases: [
      { type: "phrase", kk: "Түкке тұрмайды", ru: "Гроша ломаного не стоит", en: "Not worth a penny", tr: "тукке турмайды" },
      { type: "phrase", kk: "Ештеңе етпейді", ru: "Ничего страшного", en: "It's no big deal", tr: "ештеңе етпейди" },
      { type: "phrase", kk: "Әрине", ru: "Конечно", en: "Of course", tr: "әрине" },
    ] },

  // ── XIII. АТТАР ────────────────────────
  { id: 38, module: "attar", title: "Есімдер", ru: "Имена людей", en: "Personal Names", video: null,
    note: {
      ru: "Многие казахские имена несут значение — это пожелание качеств ребёнку: света, счастья, силы.",
      en: "Many Kazakh names carry meaning — a wish of qualities for the child: light, happiness, strength.",
    },
    phrases: [
      { type: "term", kk: "Есім", ru: "имя", en: "name", tr: "есим" },
      { type: "phrase", kk: "Нұр — «свет»", ru: "Нұр — «свет» (в именах Нұрлан, Нұргүл)", en: "Nur — 'light' (in names Nurlan, Nurgul)", tr: "нур" },
      { type: "phrase", kk: "Балаға ат қою", ru: "Наречение имени ребёнку", en: "Naming a child", tr: "балага ат кою" },
    ] },
  { id: 39, module: "attar", title: "Жер атаулары", ru: "Топонимы", en: "Place Names", video: null,
    phrases: [
      { type: "term", kk: "Атау", ru: "название", en: "name (of a place/thing)", tr: "атау" },
      { type: "phrase", kk: "Алматы — «алма» (яблоко)", ru: "Алматы — от «алма» (яблоко)", en: "Almaty — from 'alma' (apple)", tr: "алматы" },
      { type: "phrase", kk: "Астана — «столица»", ru: "Астана — «столица»", en: "Astana — 'the capital'", tr: "астана" },
    ] },
  { id: 40, module: "attar", title: "Атаулар", ru: "Названия вокруг нас", en: "Everyday Names", video: null,
    phrases: [
      { type: "phrase", kk: "Наурыз — көктем айы", ru: "Наурыз — весенний месяц и праздник", en: "Nauryz — a spring month and holiday", tr: "наурыз" },
      { type: "phrase", kk: "Дүйсенбі — аптаның басы", ru: "Понедельник — начало недели", en: "Monday — the start of the week", tr: "дуйсенби" },
      { type: "phrase", kk: "Домбыра — ұлттық аспап", ru: "Домбра — национальный инструмент", en: "The dombra — a national instrument", tr: "домбыра" },
    ] },

  // ── XIV. РУ СӨЗДЕРІ ────────────────────
  { id: 41, module: "ru", title: "Ру туралы сөздер", ru: "Меткие слова о родах", en: "Sayings about Clans", video: null,
    note: {
      ru: "Казахи любят добродушно подшучивать над родами — это игровая, тренировочная часть культуры, без настоящей вражды.",
      en: "Kazakhs enjoy good-natured teasing about clans — a playful part of the culture, with no real enmity.",
    },
    phrases: [
      { type: "phrase", kk: "Қырық рулы қазақпыз", ru: "Мы казахи сорока родов", en: "We are the Kazakhs of forty clans", tr: "кырык рулы казакпыз" },
      { type: "phrase", kk: "Руың кім?", ru: "Из какого ты рода?", en: "Which clan are you from?", tr: "руың ким" },
      { type: "phrase", kk: "Біз бір атаның балаларымыз", ru: "Мы дети одного предка", en: "We are children of one ancestor", tr: "биз бир атаның балаларымыз" },
    ] },
];

export function lessonsByModule(moduleId) {
  return lessons.filter((l) => l.module === moduleId);
}

// Все фразы одним массивом — для практики (карточки, квиз).
export const allPhrases = lessons.flatMap((l) =>
  l.phrases.map((p) => ({ ...p, lesson: l.title, lessonId: l.id }))
);
