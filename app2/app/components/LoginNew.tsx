"use client";

import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { createSignerFromKey } from "@nillion/client-payments";
import { useNillionAuth, UserCredentials } from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";
import { NilChainAddressPrefix } from "@nillion/client-core";
import { useNillionWallet } from "../use-nillion-wallet";

export const LoginNew = () => {
  const { providerWithSigner, acc0 } = useNillionWallet();

  const handleLogin = async () => {
    console.log("hey");
    if (providerWithSigner && acc0) {
      let balance = await providerWithSigner.getAllBalances(acc0.address);
      console.log(balance);
    }
  };

  return (
    <div className="flex-row flex my-6">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogin}
      >
        LoginNew
        {/* {isLoading ? "Logging in..." : "Login"} */}
      </button>
    </div>
  );
};
