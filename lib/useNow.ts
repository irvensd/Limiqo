import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { msUntilNextGreetingChange, msUntilNextLocalMidnight } from "./helpers";

export function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      const current = new Date();
      setNow(current);
      const wait = Math.max(
        250,
        Math.min(msUntilNextLocalMidnight(current), msUntilNextGreetingChange(current)),
      );
      timer = setTimeout(tick, wait);
    }

    tick();
    const sub = AppState.addEventListener("change", (status) => {
      if (status !== "active") return;
      clearTimeout(timer);
      tick();
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return now;
}
