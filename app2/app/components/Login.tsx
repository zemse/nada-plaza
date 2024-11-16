"use client";

import { createSignerFromKey } from "@nillion/client-payments";
import { useNillionAuth, UserCredentials } from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";

export const Login = () => {
  const { authenticated, login, logout } = useNillionAuth();
  // Feel free to set this to other values + useSetState
  const SEED = "example-secret-seed";
  const SECRET_KEY =
    // "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5";
    "090457f88be8a82c39533e68edbb055e899152a0aff6a4402f9f31f2cc87fae4";

  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    console.log("authenticated", authenticated);
  }, [authenticated]);

  const handleLogin = async () => {
    const wallet = await createSignerFromKey(SECRET_KEY);
    const acc = await wallet.getAccounts();
    setAddress(acc[0].address);

    try {
      setIsLoading(true);
      const credentials: UserCredentials = {
        userSeed: SEED,
        signer: async () => wallet,
      };
      console.log("start 1");
      await login(credentials);
      console.log("start last");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-row flex my-6">
      {authenticated ? (
        <>
          Your address: {address}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Logout"}
          </button>
        </>
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      )}
    </div>
  );
};
