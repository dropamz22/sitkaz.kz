// Озвучка казахских фраз.
// 1) Если есть готовый mp3 (сгенерирован Azure TTS) — играем его.
// 2) Иначе — запасной браузерный синтез речи (с акцентом, но лучше чем тишина).
//
// speak(text, { onEnd }) — onEnd вызывается, когда озвучка доиграла до конца
// (или сразу, если играть нечем). По нему экран решает, когда переходить дальше,
// чтобы авто-переход не обрывал звук на полуслове.

import { AUDIO } from "../data/audioManifest";

let current = null;

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
      current = new Audio(`/audio/${file}`);
      if (onEnd) current.addEventListener("ended", onEnd, { once: true });
      // Если файл не проигрался — падаем в синтез, и уже он сообщит об окончании
      current.play().catch(() => synth(text, onEnd));
      return;
    } catch {
      // упадём в синтез ниже
    }
  }
  synth(text, onEnd);
}
