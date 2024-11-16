import { useEffect, useState } from "react";

export function useLocalStorage() {
  const [pkhash, setPkhash] = useState<string>();
  useEffect(() => {
    setInterval(async () => {
      const value = window.localStorage.getItem("pkhash");
      if (value !== null) {
        setPkhash(value);
      }
    }, 50);
  }, []);

  const [pkhash2, setPkhash2] = useState<string>();
  useEffect(() => {
    setInterval(async () => {
      const value = window.localStorage.getItem("pkhash2");
      if (value !== null) {
        setPkhash2(value);
      }
    }, 50);
  }, []);

  return { pkhash, pkhash2 };
}
