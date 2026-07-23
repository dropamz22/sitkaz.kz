// Диалоги-сценки к урокам: экран-чат, собеседник пишет реплику,
// пользователь выбирает ответ из вариантов (ok: true — правильный).
//
// Каждая реплика/вариант имеет ru и en перевод — язык выбирается в интерфейсе.
// Структура:
//   { lessonId, title, titleEn, intro, introEn,
//     steps: [ { bot: {kk, ru, en}, options: [ {kk, ru, en, ok?} ] } ] }

export const dialogs = [
  {
    lessonId: 1,
    title: "Знакомство", titleEn: "Getting Acquainted",
    intro: "Ты на встрече. К тебе подходит Айгүль — познакомься с ней.",
    introEn: "You're at a meetup. Aigul walks up to you — get to know her.",
    steps: [
      {
        bot: { kk: "Сәлеметсіз бе! Танысып қоялық, менің атым Айгүль.", ru: "Здравствуйте! Давайте познакомимся, меня зовут Айгуль.", en: "Hello! Let's get acquainted, my name is Aigul." },
        options: [
          { kk: "Сәлеметсіз бе! Менің атым Олег.", ru: "Здравствуйте! Меня зовут Олег.", en: "Hello! My name is Oleg.", ok: true },
          { kk: "Сау болыңыз!", ru: "До свидания!", en: "Goodbye!" },
          { kk: "Түсінбедім.", ru: "Я не понял.", en: "I didn't understand." },
        ],
      },
      {
        bot: { kk: "Сізбен танысқаныма қуаныштымын! Сіз қайдансыз?", ru: "Рада с вами познакомиться! Вы откуда?", en: "Nice to meet you! Where are you from?" },
        options: [
          { kk: "Менің екі балам бар.", ru: "У меня двое детей.", en: "I have two children." },
          { kk: "Мен Алматыданмын.", ru: "Я из Алматы.", en: "I'm from Almaty.", ok: true },
          { kk: "Бұл менің ағам.", ru: "Это мой старший брат.", en: "This is my older brother." },
        ],
      },
      {
        bot: { kk: "Немен айналысасыз?", ru: "Чем вы занимаетесь?", en: "What do you do?" },
        options: [
          { kk: "Шай ішіп кетіңіз.", ru: "Выпейте чаю.", en: "Have some tea." },
          { kk: "Ол ұзын бойлы.", ru: "Он высокого роста.", en: "He is tall." },
          { kk: "Мен дәрігермін.", ru: "Я врач.", en: "I'm a doctor.", ok: true },
        ],
      },
      {
        bot: { kk: "Жақсы! Кездескенше сау болыңыз!", ru: "Хорошо! До встречи, всего доброго!", en: "Great! See you, all the best!" },
        options: [
          { kk: "Сау болыңыз! Кездескенше!", ru: "Всего доброго! До встречи!", en: "All the best! See you!", ok: true },
          { kk: "Танысып қоялық.", ru: "Давайте познакомимся.", en: "Let's get acquainted." },
          { kk: "Отбасыңызда неше адам бар?", ru: "Сколько человек в вашей семье?", en: "How many people are in your family?" },
        ],
      },
    ],
  },
  {
    lessonId: 6,
    title: "Разговор о семье", titleEn: "Talking About Family",
    intro: "Коллега расспрашивает тебя о семье.",
    introEn: "A colleague is asking you about your family.",
    steps: [
      {
        bot: { kk: "Отбасыңызда неше адам бар?", ru: "Сколько человек в вашей семье?", en: "How many people are in your family?" },
        options: [
          { kk: "Менің отбасым үлкен.", ru: "У меня большая семья.", en: "I have a big family.", ok: true },
          { kk: "Домбыра — ұлттық аспап.", ru: "Домбра — национальный инструмент.", en: "The dombra is a national instrument." },
          { kk: "Мен таңертең ерте тұрамын.", ru: "Я встаю рано утром.", en: "I get up early in the morning." },
        ],
      },
      {
        bot: { kk: "Балаларыңыз бар ма?", ru: "У вас есть дети?", en: "Do you have children?" },
        options: [
          { kk: "Ол әдемі киінеді.", ru: "Она красиво одевается.", en: "She dresses beautifully." },
          { kk: "Иә, менің екі балам бар.", ru: "Да, у меня двое детей.", en: "Yes, I have two children.", ok: true },
          { kk: "Кешке демаламын.", ru: "Вечером я отдыхаю.", en: "In the evening I rest." },
        ],
      },
      {
        bot: { kk: "Ата-анаңыз қайда тұрады?", ru: "А где живут ваши родители?", en: "Where do your parents live?" },
        options: [
          { kk: "Бұл күй өте әдемі.", ru: "Этот кюй очень красивый.", en: "This melody is very beautiful." },
          { kk: "Мен ән тыңдағанды жақсы көремін.", ru: "Я люблю слушать песни.", en: "I love listening to songs." },
          { kk: "Атам мен әжем ауылда тұрады.", ru: "Дедушка и бабушка живут в ауле.", en: "My grandparents live in the village.", ok: true },
        ],
      },
      {
        bot: { kk: "Қандай жақсы! Отбасы — ең маңызды нәрсе.", ru: "Как хорошо! Семья — самое важное.", en: "How nice! Family is the most important thing." },
        options: [
          { kk: "Иә, дұрыс айтасыз!", ru: "Да, верно говорите!", en: "Yes, you're right!", ok: true },
          { kk: "Сіз қай рудансыз?", ru: "Вы из какого рода?", en: "Which clan are you from?" },
          { kk: "Жұмысқа қалай барасыз?", ru: "Как вы добираетесь до работы?", en: "How do you get to work?" },
        ],
      },
    ],
  },
  {
    lessonId: 12,
    title: "В гостях", titleEn: "Being a Guest",
    intro: "Тебя пригласили в гости. Хозяйка встречает тебя у двери.",
    introEn: "You've been invited over. The host greets you at the door.",
    steps: [
      {
        bot: { kk: "Қош келдіңіз! Төрге шығыңыз!", ru: "Добро пожаловать! Проходите на почётное место!", en: "Welcome! Please take the seat of honor!" },
        options: [
          { kk: "Рақмет! Үйіңіз өте жақсы екен.", ru: "Спасибо! Какой у вас хороший дом.", en: "Thank you! What a lovely home you have.", ok: true },
          { kk: "Немен айналысасыз?", ru: "Чем вы занимаетесь?", en: "What do you do?" },
          { kk: "Ол сабырлы кісі.", ru: "Он спокойный человек.", en: "He is a calm person." },
        ],
      },
      {
        bot: { kk: "Шай ішесіз бе?", ru: "Будете чай?", en: "Would you like some tea?" },
        options: [
          { kk: "Оның шашы қара.", ru: "У неё чёрные волосы.", en: "She has black hair." },
          { kk: "Иә, рақмет, шай ішемін.", ru: "Да, спасибо, выпью чаю.", en: "Yes, thank you, I'll have some tea.", ok: true },
          { kk: "Мен таңертең ерте тұрамын.", ru: "Я встаю рано утром.", en: "I get up early in the morning." },
        ],
      },
      {
        bot: { kk: "Тағы шай құяйын ба?", ru: "Налить ещё чаю?", en: "Shall I pour you more tea?" },
        options: [
          { kk: "Сіз қайдансыз?", ru: "Вы откуда?", en: "Where are you from?" },
          { kk: "Бүгін не істейміз?", ru: "Что делаем сегодня?", en: "What are we doing today?" },
          { kk: "Жоқ, рақмет, тойдым.", ru: "Нет, спасибо, я наелся.", en: "No, thank you, I'm full.", ok: true },
        ],
      },
      {
        bot: { kk: "Келгеніңізге рақмет!", ru: "Спасибо, что пришли!", en: "Thank you for coming!" },
        options: [
          { kk: "Шақырғаныңызға рақмет! Сау болыңыз!", ru: "Спасибо за приглашение! Всего доброго!", en: "Thanks for the invitation! All the best!", ok: true },
          { kk: "Төрге шығыңыз!", ru: "Проходите на почётное место!", en: "Take the seat of honor!" },
          { kk: "Ел бірлікте — күшті.", ru: "Народ силён в единстве.", en: "A nation is strong in unity." },
        ],
      },
    ],
  },
];

export const dialogForLesson = (lessonId) => dialogs.find((d) => d.lessonId === lessonId) || null;
