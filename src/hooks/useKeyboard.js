import { useEffect, useRef } from "react";

/**
 * Handles Bluetooth button / keyboard scoring.
 *
 * Default key: Space (works with most selfie / presentation buttons paired as HID).
 * 1 tap  → Team A point
 * 2 taps → Team B point  (400 ms window between taps)
 * Hold 2s → Undo
 *
 * The user can configure which key to use via the `tapKey` prop.
 */
export function useKeyboard({ onTeamA, onTeamB, onUndo, tapKey = " " }) {
  // Use refs for callbacks so the effect never needs to re-run
  const cbRef = useRef({ onTeamA, onTeamB, onUndo });
  useEffect(() => {
    cbRef.current = { onTeamA, onTeamB, onUndo };
  });

  const tapCount = useRef(0);
  const tapTimer = useRef(null);
  const pressStart = useRef(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    const key = tapKey;

    function onKeyDown(e) {
      console.log("KEY:", e.key);

      if (e.repeat) return;

      if (e.key === "MediaPlayPause") {
        handleMediaKey();
        return;
      }

      // fallback teclado normal
      if (e.key === tapKey) {
        handleMediaKey();
        return;
      }
    }

    function onKeyUp(e) {
      if (e.key !== key) return;
      clearTimeout(longPressTimer.current);
      if (longPressTriggered.current) return;

      tapCount.current += 1;
      clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => {
        const count = tapCount.current;
        tapCount.current = 0;
        if (count === 1) cbRef.current.onTeamA();
        else if (count >= 2) cbRef.current.onTeamB();
      }, 400);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      clearTimeout(tapTimer.current);
      clearTimeout(longPressTimer.current);
    };
  }, [tapKey]);

  function handleMediaKey() {
    tapCount.current += 1;

    clearTimeout(tapTimer.current);

    tapTimer.current = setTimeout(() => {
      const count = tapCount.current;
      tapCount.current = 0;

      if (count === 1) cbRef.current.onTeamA();
      else if (count === 2) cbRef.current.onTeamB();
      else if (count >= 3) cbRef.current.onUndo();
    }, 400);
  }
}
