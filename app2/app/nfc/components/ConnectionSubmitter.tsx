import { useNilStoreValue } from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";
import axios from "axios";
import { useWallet } from "../hooks/useWallet";
import { ethers } from "ethers";

export default function ConnectionSubmitter() {
  const [connections, setConnections] = useState<string[]>();
  const nilStore = useNilStoreValue();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const { nonce_account } = useWallet();

  useEffect(() => {
    if (!connections && nonce_account) {
      (async () => {
        const result = await axios.get(
          "https://api.nadaplaza.bytes31.com/get-connections?account=" +
            ethers.getAddress(nonce_account),
        );
        console.log("conn res", result.data);
        const padded_arr = result.data.slice();
        while (padded_arr.length < 10) {
          padded_arr.push(ethers.hexlify(ethers.randomBytes(6)).slice(2));
        }
        console.log("conn arr", padded_arr);
        setConnections(padded_arr);
      })();
    }
  });

  const handleStore = async () => {
    if (!connections) {
      throw new Error("connections required");
    }

    setProgress(1);
    try {
      const result = await nilStore.executeAsync({
        name: "data",
        data: JSON.stringify(connections),
        ttl: 1,
      });
      console.log(result);
      setStoreId(result);
      setProgress(2);

      const pkhash = window.localStorage.getItem("pkhash");
      if (!pkhash) {
        throw new Error("pkhash is empty, this should not happen");
      }
      const api_result = await axios.post(
        "https://api.nadaplaza.bytes31.com/post-uid-storeid",
        {
          uid: pkhash,
          storeid: result,
        },
      );
      console.log("post api result", api_result.data);
    } catch (err) {
      alert(err);
      setProgress(0);
    }
  };

  return (
    <p style={{ color: "black" }}>
      <br />
      {progress === 0 ? (
        <button
          onClick={handleStore}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all font-medium"
        >
          Submit Connections to Nillion
        </button>
      ) : null}

      {progress === 1 ? <p>Storing connections...</p> : null}
      {progress === 2 ? <p>Connections stored! StoreID: {storeId}</p> : null}
    </p>
  );
}
