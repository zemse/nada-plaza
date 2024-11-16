import { useNilStoreValue } from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";

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
    } catch (err) {
      alert(err);
      setProgress(0);
    }
  };

  return (
    <p style={{ color: "black" }}>
      <br />
      {progress === 0 ? (
        <button onClick={handleStore}>Submit Connections to Nillion</button>
      ) : null}

      {progress === 1 ? <p>Storing connections...</p> : null}

      {progress === 2 ? <p>Connections stored! StoreID: {storeId}</p> : null}
    </p>
  );
}
