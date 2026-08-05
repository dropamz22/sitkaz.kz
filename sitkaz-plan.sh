#!/usr/bin/env bash
# ============================================================================
#  sitkaz — пошаговый план доработки для терминала macOS
#
#  Первый раз сделать исполняемым:   chmod +x sitkaz-plan.sh
#  Запуск (из корня проекта):        ./sitkaz-plan.sh <шаг>
#  или без chmod:                    bash sitkaz-plan.sh <шаг>
#  Список всех шагов:                ./sitkaz-plan.sh list
#  Открыть файл в редакторе (macOS): ./sitkaz-plan.sh edit app/page.jsx
#
#  Работает в стандартном Терминале macOS (bash и zsh). Требуются node и git
#  (git ставится вместе с Xcode Command Line Tools: xcode-select --install).
#
#  Механические шаги (чистка, README, EN-переводы, проверки) выполняются
#  реально. Шаги-фичи печатают инструкцию: какой файл открыть и что менять.
#  Всё обратимо: удаление через git, лишние аудио переносятся в бэкап-папку.
# ============================================================================

set -u
cd "$(dirname "$0")" || exit 1

c_ok(){ printf "\033[32m%s\033[0m\n" "$*"; }
c_hd(){ printf "\n\033[1;31m==> %s\033[0m\n" "$*"; }
c_man(){ printf "\033[33m‼ РУЧНОЙ ШАГ (правка кода в редакторе):\033[0m %s\n" "$*"; }
c_edit(){ printf "   открыть в редакторе:  \033[36m./sitkaz-plan.sh edit %s\033[0m\n" "$*"; }
guard(){ [ -f package.json ] || { echo "Запусти из корня проекта sitkaz (тут нет package.json)"; exit 1; }; }

# in-place sed, совместимый и с macOS (BSD sed), и с GNU sed
sed_i(){ local e="$1"; shift; if sed --version >/dev/null 2>&1; then sed -i -e "$e" "$@"; else sed -i '' -e "$e" "$@"; fi; }

# ---------------------------------------------------------------------------
# ФАЗА 0 — запуск без блокеров
# ---------------------------------------------------------------------------
step_0_1(){ c_hd "Шаг 0.1 — свой домен вместо *.vercel.app  [СДЕЛАНО]"; c_ok "Отмечено как выполнено."; }

step_0_2(){
  c_hd "Шаг 0.2 — проверка входа и статус безопасности"
  echo "Открой приложение на 3-4 устройствах/сетях (Android, iOS, десктоп; моб. и Wi-Fi), в т.ч. внутри Telegram."
  echo "Открываю статус домена в Google Safe Browsing…"
  open "https://transparencyreport.google.com/safe-browsing/search?url=app.sitkaz.kz" 2>/dev/null \
    || echo "  открой вручную: https://transparencyreport.google.com/safe-browsing/search?url=app.sitkaz.kz"
  echo "Если появляется предупреждение — добавь сайт в Google Search Console и запроси проверку безопасности."
}

step_0_3(){
  guard
  c_hd "Шаг 0.3 — проверить прод-сборку (Next 16 / React 19)"
  npm run build && c_ok "Сборка прошла." || echo "Сборка упала — смотри ошибки выше."
  echo
  echo "Если lock менялся:  git add package-lock.json && git commit -m 'chore: lock deps'"
}

# ---------------------------------------------------------------------------
# ФАЗА 1 — удержание и данные (правка кода)
# ---------------------------------------------------------------------------
step_1_1(){ c_hd "Шаг 1.1 — предупреждение про локальный прогресс / аккаунты"
  c_man "показать подсказку «прогресс только на этом устройстве», когда нет Telegram и облака"
  c_edit "lib/storage.js"; c_edit "app/page.jsx"; c_edit "lib/i18n.js"
  echo "  • В storage.js уже есть serverAvailable()/cloudAvailable() — если оба false, это тот случай."
  echo "  • Максимум: довести серверную синхронизацию (Supabase) до лёгких аккаунтов."; }

step_1_2(){ c_hd "Шаг 1.2 — ежедневные напоминания через Telegram-бот"
  c_man "крон раз в день: «N фраз до цели» / «серия под угрозой»"
  c_edit "app/api/telegram/route.js"; c_edit "lib/supabase.js"
  echo "  • Планировщик — Vercel Cron (файл vercel.json: schedule + путь к API-маршруту)."
  echo "  • Список и состояние брать из таблиц users/progress."; }

step_1_3(){ c_hd "Шаг 1.3 — заморозка серии (streak freeze)"
  c_man "один пропуск в неделю не обнуляет серию"
  c_edit "lib/srs.js"; c_edit "app/page.jsx"; }

step_1_4(){ c_hd "Шаг 1.4 — календарь активности + итог недели"
  c_man "тепловая карта дней на экране Прогресс + недельная сводка"
  c_edit "app/page.jsx"; c_edit "lib/srs.js"; }

# ---------------------------------------------------------------------------
# ФАЗА 2 — быстрые правки (выполняются реально)
# ---------------------------------------------------------------------------
step_2_1(){
  guard
  c_hd "Шаг 2.1 — EN-переводы всех достижений (lib/game.js)"
  cp lib/game.js lib/game.js.bak
  node -e '
    const fs=require("fs"); const f="lib/game.js"; let s=fs.readFileSync(f,"utf8");
    const map={
      "3 дня подряд":"3-day streak",
      "Неделя без пропусков":"A full week, no gaps",
      "Месяц! Нағыз батыр":"A month! Nağyz batyr",
      "10 фраз выучено":"10 phrases learned",
      "50 фраз выучено":"50 phrases learned",
      "Мінсіз: квиз 10 из 10":"Flawless: quiz 10/10",
      "Все диалоги пройдены":"All dialogues complete",
      "Высота 1000 метров":"1000 meters high"
    };
    let n=0;
    for (const [ru,en] of Object.entries(map)) {
      const from=`title: "${ru}",`;
      if (s.includes(from) && !s.includes(`title: "${ru}", en:`)) { s=s.replace(from, `title: "${ru}", en: "${en}",`); n++; }
    }
    fs.writeFileSync(f,s); console.log("Добавлено переводов:", n);
  '
  echo "Бэкап: lib/game.js.bak (удали, если всё ок: rm lib/game.js.bak)"
  c_ok "Готово. Проверь в EN-режиме экран Прогресс."
}

step_2_5(){
  guard
  c_hd "Шаг 2.5 — убрать мёртвый код и лишние аудио"
  echo "— data/examples.js (через git, обратимо):"
  git rm data/examples.js 2>/dev/null && c_ok "examples.js удалён (git rm)." || echo "  Пропущено (уже нет или не под git)."
  echo
  echo "— неиспользуемые аудио → public/_audio_unused/ (перенос, не удаление):"
  node -e '
    (async()=>{
      const fs=require("fs"), path=require("path");
      const dir="public/audio", back="public/_audio_unused";
      const m=await import("./data/audioManifest.js");
      const used=new Set(Object.values(m.AUDIO));
      if(!fs.existsSync(dir)){console.log("нет public/audio");return;}
      const files=fs.readdirSync(dir).filter(f=>f.endsWith(".mp3"));
      const orphans=files.filter(f=>!used.has(f));
      if(!orphans.length){console.log("лишних файлов нет");return;}
      fs.mkdirSync(back,{recursive:true});
      for(const f of orphans) fs.renameSync(path.join(dir,f), path.join(back,f));
      console.log("Перенесено в", back+":", orphans.length, "файлов");
    })().catch(e=>console.error(e));
  '
  c_ok "Готово. Проверь приложение, потом можно удалить public/_audio_unused."
}

step_2_6(){
  guard
  c_hd "Шаг 2.6 — обновить README и комментарии (6 тем / 20 уроков)"
  sed_i 's/14 модулей, 41 урок/6 модулей, 20 уроков/g' README.md && echo "README.md: счёт исправлен"
  sed_i 's/все 14 тем/все 6 тем/g' lib/game.js && echo "lib/game.js: комментарий исправлен"
  c_ok "Готово."
  echo "По желанию вручную: в README убрать формулировку «структурный скелет» — контент реальный."
}

step_2_2(){ c_hd "Шаг 2.2 — «+50 м» показывать только при первом прохождении"
  c_man "текст всегда обещает +50 м, а начисление одноразовое (markDone) — привести в соответствие"
  c_edit "app/page.jsx"; }

step_2_3(){ guard; c_hd "Шаг 2.3 — проверить склонения «фраз/уроков/терминов»"
  echo "Места, где число выводится рядом со словом:"
  grep -rnE 'phrases_count|phrasesWord|lessonsWord|dialogsWord' app/ lib/ | sed 's/^/  /'
  echo
  echo "Внимание: lib/i18n.js phrases_count всегда даёт «фраз» без склонения — это надо поправить."
  c_man "убедиться, что везде применены функции склонения (plural)"
  c_edit "lib/i18n.js"; }

step_2_4(){ c_hd "Шаг 2.4 — encodeURIComponent в запросах Supabase"
  c_man "обернуть значения фильтров (telegram_id и т.п.) в encodeURIComponent"
  c_edit "lib/supabase.js"
  echo "  • Пример: \`progress?telegram_id=eq.\${encodeURIComponent(telegramId)}&select=data\`"; }

# ---------------------------------------------------------------------------
# ФАЗА 3 — контент
# ---------------------------------------------------------------------------
step_3_1(){ guard; c_hd "Шаг 3.1 — вычитка носителем + дубли EN-перевода"
  echo "Поиск одинаковых EN-переводов у разных фраз (дают дубль-ответ в квизе):"
  node -e '
    (async()=>{ const c=await import("./data/course.js");
      const seen={}; for(const p of c.allPhrases){ if(!p.en) continue; (seen[p.en]=seen[p.en]||[]).push(p.kk); }
      const dup=Object.entries(seen).filter(([,v])=>v.length>1);
      if(!dup.length){console.log("дублей EN-перевода нет");return;}
      console.log("Дубли EN-перевода:"); dup.forEach(([en,kk])=>console.log("  \""+en+"\" <- "+kk.join(" | ")));
    })().catch(e=>console.error(e));
  '
  c_man "вычитать EN и транслитерацию носителем, развести дубли"
  c_edit "data/course.js"; }

step_3_2(){ guard; c_hd "Шаг 3.2 — культурные заметки (note) для уроков"
  echo "Сейчас заметок в курсе: $(grep -c 'note:' data/course.js)"
  c_man "добавить поле note: { ru, en } к нужным урокам (каркас экрана уже есть)"
  c_edit "data/course.js"; }

step_3_3(){ guard; c_hd "Шаг 3.3 — диалоги-сценки для большинства тем"
  echo "Сейчас диалогов: $(grep -c 'lessonId:' data/dialogs.js) (из 20 уроков)"
  c_man "добавить диалоги по образцу существующих (lessonId, steps[])"
  c_edit "data/dialogs.js"; }

step_3_4(){ c_hd "Шаг 3.4 — видео-лекции"
  c_man "поле video не заполнено ни в одном уроке; добавить embed + подключить плеер, оформить права"
  c_edit "data/course.js"; c_edit "app/page.jsx"; }

# ---------------------------------------------------------------------------
# ФАЗА 4 — аудио и произношение
# ---------------------------------------------------------------------------
step_4_1(){ c_hd "Шаг 4.1 — офлайн-кэш аудио (PWA)"
  c_man "кэшировать mp3 через service worker: офлайн-работа и быстрый старт"
  c_edit "public/manifest.json"; c_edit "lib/audio.js"; }

step_4_2(){ guard; c_hd "Шаг 4.2 — озвучить фразы-примеры (Azure)"
  echo "Нужны переменные Azure в окружении (ключ/регион). Запуск:"
  echo "  npm run audio:azure"
  c_man "при необходимости — доработать scripts/gen-audio-azure.mjs под type=colloc"
  c_edit "scripts/gen-audio-azure.mjs"; }

step_4_3(){ c_hd "Шаг 4.3 — настройки озвучки (скорость/голос/автозвук)"
  c_man "скорость (медленно/обычно), голос (Aigul/Daulet), автозвук вкл/выкл"
  c_edit "lib/audio.js"; c_edit "app/page.jsx"; }

step_4_4(){ c_hd "Шаг 4.4 — тренажёр произношения (крупная фича, нужен бэкенд)"
  c_man "запись голоса → сравнение с эталоном (Azure Pronunciation Assessment)"; }

# ---------------------------------------------------------------------------
# ФАЗА 5 — UX
# ---------------------------------------------------------------------------
step_5_1(){ c_hd "Шаг 5.1 — продолжить урок с той же карточки"; c_man "запоминать позицию карточки и возвращать на неё"; c_edit "app/page.jsx"; c_edit "lib/storage.js"; }
step_5_2(){ c_hd "Шаг 5.2 — список слов урока + поиск"; c_man "режим списком + строка поиска по kk/ru"; c_edit "app/page.jsx"; c_edit "data/course.js"; }
step_5_3(){ c_hd "Шаг 5.3 — избранное / трудные слова"; c_man "звёздочка → отдельная колода «Мои трудные»"; c_edit "app/page.jsx"; c_edit "lib/storage.js"; }
step_5_4(){ c_hd "Шаг 5.4 — экран настроек"; c_man "язык, голос, автозвук, шрифт, напоминания, сброс прогресса — в одном месте"; c_edit "app/page.jsx"; }
step_5_5(){ c_hd "Шаг 5.5 — тёмная тема"; c_man "тёмная палитра (переменные уже есть) + переключатель/авто"; c_edit "app/globals.css"; c_edit "app/page.jsx"; }
step_5_6(){ c_hd "Шаг 5.6 — размер шрифта"; c_man "настройка крупнее/мельче"; c_edit "app/globals.css"; }

# ---------------------------------------------------------------------------
# ФАЗА 6 — монетизация
# ---------------------------------------------------------------------------
step_6_1(){ c_hd "Шаг 6.1 — серверная проверка доступа (демо ТЕК бесплатно)"; c_man "гейтинг тем на сервере; тема ТЕК бесплатно"; c_edit "lib/supabase.js"; c_edit "app/page.jsx"; }
step_6_2(){ c_hd "Шаг 6.2 — оплата / подписка"; c_man "приём оплаты + выдача доступа после платежа (платёжный вебхук)"; }
step_6_3(){ c_hd "Шаг 6.3 — полные аккаунты и синхронизация"; c_man "довести хранилище до аккаунтов с синхронизацией между устройствами"; c_edit "lib/storage.js"; c_edit "lib/supabase.js"; c_edit "app/api/progress/route.js"; }

# ---------------------------------------------------------------------------
# Служебное
# ---------------------------------------------------------------------------
commit(){ guard; c_hd "Зафиксировать изменения в git"; git add -A && git status --short
  echo; echo "Коммит:  git commit -m 'sitkaz: правки по плану доработки'"; }

edit(){ shift; [ $# -gt 0 ] && open "$@" || echo "укажи файл: ./sitkaz-plan.sh edit app/page.jsx"; }

all(){ step_2_1; step_2_5; step_2_6; echo; c_ok "Авто-шаги фазы 2 выполнены. Проверь приложение и закоммить (./sitkaz-plan.sh commit)."; }

list(){
cat <<'MENU'
Использование:  ./sitkaz-plan.sh <шаг>     (или bash sitkaz-plan.sh <шаг>)

  ФАЗА 0 — запуск без блокеров
    0_1   свой домен            [СДЕЛАНО]
    0_2   проверка входа/безопасности   (откроет браузер)
    0_3   прод-сборка (npm run build)

  ФАЗА 1 — удержание (правка кода)
    1_1   предупреждение про локальный прогресс / аккаунты
    1_2   напоминания в Telegram
    1_3   заморозка серии
    1_4   календарь активности + итог недели

  ФАЗА 2 — быстрые правки (выполняются реально)
    2_1   EN-переводы достижений        ← авто
    2_2   текст «+50 м»
    2_3   проверка склонений            ← авто (поиск)
    2_4   encodeURIComponent в Supabase
    2_5   удалить мёртвый код + лишние аудио   ← авто
    2_6   обновить README/комментарии   ← авто

  ФАЗА 3 — контент
    3_1   вычитка носителем + дубли EN  ← авто (поиск)
    3_2   культурные заметки (note)
    3_3   диалоги для тем
    3_4   видео-лекции

  ФАЗА 4 — аудио
    4_1   офлайн-кэш (PWA)
    4_2   озвучка примеров              ← npm run audio:azure
    4_3   настройки озвучки
    4_4   тренажёр произношения

  ФАЗА 5 — UX
    5_1..5_6   продолжить с карточки / список слов / поиск /
               избранное / настройки / тёмная тема / шрифт

  ФАЗА 6 — монетизация
    6_1   серверный гейтинг доступа
    6_2   оплата / подписка
    6_3   полные аккаунты

  Прочее
    all      выполнить все АВТО-шаги фазы 2 подряд
    commit   статус git + подсказка по коммиту
    edit F   открыть файл в редакторе (macOS open), напр.: edit app/page.jsx

Примеры:
    ./sitkaz-plan.sh 2_1
    ./sitkaz-plan.sh all
    ./sitkaz-plan.sh edit app/page.jsx
MENU
}

arg="${1:-list}"
case "$arg" in
  list|help|-h|--help) list ;;
  all) all ;;
  commit) commit ;;
  edit) edit "$@" ;;
  *) fn="step_${arg}"; if declare -f "$fn" >/dev/null; then "$fn"; else echo "Нет такого шага: $arg"; echo; list; fi ;;
esac
