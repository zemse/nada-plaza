import { useEffect, useState } from "react";
import { randomBytes, hexlify } from "ethers";
import { createSignerFromKey } from "@nillion/client-payments";
import { useNillionAuth } from "@nillion/client-react-hooks";

export function useWallet() {
  const [key, setKey] = useState("");
  const [address, setAddress] = useState("");
  const { authenticated, login } = useNillionAuth();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const key = window.localStorage.getItem("key");
    if (key) {
      setKey(key);
    } else {
      const key = hexlify(randomBytes(32)).slice(2);
      setKey(key);
      window.localStorage.setItem("key", key);
    }
  }, []);

  useEffect(() => {
    if (!key) return;

    (async () => {
      const wallet = await createSignerFromKey(key);
      const acc = await wallet.getAccounts();
      setAddress(acc[0].address);
      setProgress(1);
      await login({
        userSeed: "example-secret-seed",
        signer: async () => wallet,
      });
      setProgress(2);
    })();
  }, [key]);

  return { key, address, progress };
}
