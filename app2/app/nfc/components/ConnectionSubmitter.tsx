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
  const [isHovered, setIsHovered] = useState(false);


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


<style>
  {`
  .submit-button {
    padding: 10px 20px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }

  .submit-button:hover {
    background-color: #0056b3;
  }
`}
</style>;

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "1rem",
        textAlign: "center",
        color: "#333",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
        }}
      >
        Submit Your Connections to Nillion
      </h1>
      {progress === 0 && (
        <button
          onClick={handleStore}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: isHovered ? "#0056b3" : "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "background-color 0.3s ease",
          }}
        >
          Submit Connections
        </button>
      )}

      {progress === 1 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "10px",
            border: "1px solid #ffc107",
            backgroundColor: "#fff3cd",
            borderRadius: "5px",
            color: "#856404",
          }}
        >
          <p>
            <strong>Storing connections...</strong>
          </p>
        </div>
      )}

      {progress === 2 && storeId && (
        <div
          style={{
            marginTop: "1rem",
            padding: "10px",
            border: "1px solid #28a745",
            backgroundColor: "#d4edda",
            borderRadius: "5px",
            color: "#155724",
          }}
        >
          <p>
            <strong>Connections stored successfully!</strong>
          </p>
          <p>
            <strong>Store ID:</strong> {storeId}
          </p>
        </div>
      )}
    </div>
  );
}
