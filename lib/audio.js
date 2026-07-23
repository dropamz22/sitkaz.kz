// Озвучка казахских фраз.
// 1) Если есть готовый mp3 (сгенерирован Azure TTS) — играем его.
// 2) Иначе — запасной браузерный синтез речи (с акцентом, но лучше чем тишина).

import { AUDIO } from "../data/audioManifest";

let current = null;

function synth(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "kk-KZ";
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function speak(text) {
  if (typeof window === "undefined") return;
  const file = AUDIO[text];
  if (file) {
    try {
      if (current) { current.pause(); current.currentTime = 0; }
      current = new Audio(`/audio/${file}`);
      current.play().catch(() => synth(text));
      return;
    } catch {
      // упадём в синтез ниже
    }
  }
  synth(text);
}
