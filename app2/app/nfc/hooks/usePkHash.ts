import { useEffect, useState } from "react";

export function usePkHash() {
  const [pkhashStored, setPkhashStored] = useState<string>();
  useEffect(() => {
    setInterval(async () => {
      const value = window.localStorage.getItem("pkhash");
      if (value !== null) {
        setPkhashStored(value);
      }
    }, 50);
  }, []);

  const [pkhashScanned, setPkhashScanned] = useState<string>();
  useEffect(() => {
    setInterval(async () => {
      // @ts-ignore
      const value = window.pkhash_scanned;
      if (value !== null) {
        setPkhashScanned(value);
      }
    }, 50);
  }, []);

  return { pkhashStored, pkhashScanned };
}
