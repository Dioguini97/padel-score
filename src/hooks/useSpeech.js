import { useCallback, useRef, useState } from 'react';

export function useSpeech() {
  const [voiceEnabled, setVoiceEnabledState] = useState(true);
  const enabledRef = useRef(true);

  const setVoiceEnabled = useCallback((val) => {
    enabledRef.current = val;
    setVoiceEnabledState(val);
    if (!val) window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback(async (text, language = 'pt') => {
    if (!enabledRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === 'pt' ? 'pt-PT' : 'en-US';

    const getVoicesAsync = () =>
  new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);

    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });

    const voices = await getVoicesAsync();

    const preferred = 
      voices.find(v => v.lang === u.lang && v.name.includes('Google')) ||
      voices.find(v => v.lang === u.lang) ||
      voices[0];

    if (preferred) u.voice = preferred;

    u.rate = 0.95;
    u.pitch = 0.9;
    u.volume = 0.8;
    window.speechSynthesis.speak(u);
  }, []);

  return { speak, voiceEnabled, setVoiceEnabled };
}
