import { useCallback, useRef, useState } from 'react';

export function useSpeech() {
  const [voiceEnabled, setVoiceEnabledState] = useState(true);
  const enabledRef = useRef(true);

  const setVoiceEnabled = useCallback((val) => {
    enabledRef.current = val;
    setVoiceEnabledState(val);
    if (!val) window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text, language = 'pt') => {
    if (!enabledRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === 'pt' ? 'pt-PT' : 'en-US';
    u.rate = 1.05;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }, []);

  return { speak, voiceEnabled, setVoiceEnabled };
}
