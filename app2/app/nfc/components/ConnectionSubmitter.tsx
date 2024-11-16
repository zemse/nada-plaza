import { useNilStoreValue } from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ConnectionSubmitter() {
  const [connections, setConnections] = useState<string[]>();
  const nilStore = useNilStoreValue();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // TODO call API
    // pass UID of folks
    // get back list of connections
    if (!connections) {
      setConnections([
        "Alice",
        "Bob",
        "Charlie",
        "Charlie",
        "Charlie",
        "Alice",
        "Bob",
        "Charlie",
        "Charlie",
        "Charlie",
      ]);
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
