import { useCallback, useRef, useState } from "react";

export function useSpeech() {
  const [voiceEnabled, setVoiceEnabledState] = useState(true);
  const enabledRef = useRef(true);

  const queue = useRef([]);
  const speaking = useRef(false);

  const setVoiceEnabled = useCallback((val) => {
    enabledRef.current = val;
    setVoiceEnabledState(val);

    if (!val) {
      window.speechSynthesis?.cancel();
      queue.current = [];
      speaking.current = false;
    }
  }, []);

  const speakNext = useCallback(() => {
    if (!queue.current.length) {
      speaking.current = false;
      return;
    }

    speaking.current = true;

    const { text, lang } = queue.current.shift();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;

    const voices = window.speechSynthesis.getVoices?.() || [];

    const preferred =
      voices.find(
        (v) =>
          v.lang === lang &&
          (v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("microsoft") ||
            v.name.toLowerCase().includes("natural"))
      ) ||
      voices.find((v) => v.lang === lang && v.localService) ||
      voices.find((v) => v.lang === lang) ||
      voices[0];

    if (preferred) u.voice = preferred;

    // 🎧 tuning para menos robotico
    u.rate = 0.88;
    u.pitch = 0.8;
    u.volume = 0.95;

    u.onend = speakNext;
    u.onerror = speakNext;

    window.speechSynthesis.speak(u);
  }, []);

  const speak = useCallback((text, language = "pt") => {
    if (!enabledRef.current || !window.speechSynthesis) return;

    const lang = language === "pt" ? "pt-PT" : "en-US";

    queue.current.push({ text, lang });

    if (!speaking.current) {
      speakNext();
    }
  }, [speakNext]);

  return {
    speak,
    voiceEnabled,
    setVoiceEnabled,
  };
}