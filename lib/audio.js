// Озвучка казахских фраз.
// 1) Если есть готовый mp3 (сгенерирован Azure TTS) — играем его.
// 2) Иначе — запасной браузерный синтез речи (с акцентом, но лучше чем тишина).
//
// speak(text, { onEnd }) — onEnd вызывается, когда озвучка доиграла до конца
// (или сразу, если играть нечем). По нему экран решает, когда переходить дальше,
// чтобы авто-переход не обрывал звук на полуслове.

import { AUDIO } from "../data/audioManifest";

let current = null;

// ── Выбор голоса ──
// aigul  — женский (файлы в public/audio/)
// daulet — мужской  (те же имена файлов в public/audio/daulet/)
// Имя файла — хэш от текста и не зависит от голоса, поэтому карта AUDIO общая.
const VOICE_KEY = "sitkaz_voice";
let voice = "aigul";

export function loadVoice() {
  if (typeof window === "undefined") return voice;
  try {
    const v = localStorage.getItem(VOICE_KEY);
    if (v === "aigul" || v === "daulet") voice = v;
  } catch {}
  return voice;
}
export function getVoice() { return voice; }
export function setVoice(v) {
  voice = v === "daulet" ? "daulet" : "aigul";
  try { localStorage.setItem(VOICE_KEY, voice); } catch {}
}
loadVoice();

function synth(text, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) { onEnd && onEnd(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "kk-KZ";
  u.rate = 0.9;
  if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function speak(text, { onEnd } = {}) {
  if (typeof window === "undefined") { onEnd && onEnd(); return; }
  const file = AUDIO[text];
  if (file) {
    try {
      if (current) { current.pause(); current.currentTime = 0; }
      const src = voice === "daulet" ? `/audio/daulet/${file}` : `/audio/${file}`;
      current = new Audio(src);
      if (onEnd) current.addEventListener("ended", onEnd, { once: true });
      // Если файл не проигрался: для Daulet сначала пробуем женский файл
      // (мужской мог быть ещё не сгенерирован), затем — браузерный синтез.
      current.play().catch(() => {
        if (voice === "daulet") {
          try {
            if (current) { current.pause(); current.currentTime = 0; }
            current = new Audio(`/audio/${file}`);
            if (onEnd) current.addEventListener("ended", onEnd, { once: true });
            current.play().catch(() => synth(text, onEnd));
            return;
          } catch {}
        }
        synth(text, onEnd);
      });
      return;
    } catch {
      // упадём в синтез ниже
    }
  }
  synth(text, onEnd);
}
