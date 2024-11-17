import { useEffect, useState } from "react";
import { usePkHash } from "../hooks/usePkHash";

import axios from "axios";
import {
  useNilCompute,
  useNilComputeOutput,
  useNilFetchValue,
  useNillion,
} from "@nillion/client-react-hooks";

import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
} from "@nillion/client-core";

const base = "https://api.nadaplaza.bytes31.com";

export default function MpcComponent() {
  const { pkhashStored, pkhashScanned } = usePkHash();

  const programid =
    "615UmdBm3vxJF9k44bF97Va1Eg8JjyNeRJ1pxr1qY5NivmFZAWN4zrbUVfMnXny5MA4dmPb6cYrPRAiW6AzaPPSx/main";
  const [storeid, setStoreid] = useState<string>();
  const [storeid2, setStoreid2] = useState<string>();
  const [mpcResult, setMpcResult] = useState<string>();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const fetchStoreId = async (uid: string | undefined, setter: Function) => {
      if (!uid) return;
      try {
        const result = await axios.get(`${base}/get-storeid?uid=${uid}`);
        setter(result.data.storeid);
      } catch (error) {
        console.error("Error fetching store ID:", error);
      }
    };

    fetchStoreId(pkhashStored, setStoreid);
    fetchStoreId(pkhashScanned, setStoreid2);
  }, [pkhashStored, pkhashScanned]);

  const { client } = useNillion();
  const nilCompute = useNilCompute();
  const nilFetch = useNilFetchValue({
    type: "SecretString",
    staleAfter: 10000,
  });
  const nilComputeOutput = useNilComputeOutput();

  const performMpc = async () => {
    if (!storeid || !storeid2) return;

    setProgress(1);

    try {
      const bindings = ProgramBindings.create(programid)
        .addInputParty(PartyName.parse("data_owner1"), client.partyId)
        .addInputParty(PartyName.parse("data_owner2"), client.partyId)
        .addOutputParty(PartyName.parse("data_owner1"), client.partyId);

      const selfData = JSON.parse(
        (await nilFetch.executeAsync({ id: storeid, name: "data" })) as any,
      );
      const otherData = JSON.parse(
        (await nilFetch.executeAsync({ id: storeid2, name: "data" })) as any,
      );

      const selfDataValue = convertArray(selfData);
      const otherDataValue = convertArray(otherData);

      const values = NadaValues.create();

      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 4; j++) {
          values.insert(
            NamedValue.parse(`num1_${i}_${j}`),
            NadaValue.createSecretInteger(Number(selfDataValue[i][j])),
          );
          values.insert(
            NamedValue.parse(`num2_${i}_${j}`),
            NadaValue.createSecretInteger(Number(otherDataValue[i][j])),
          );
        }
      }

      const mpcResultId = await nilCompute.executeAsync({ bindings, values });
      const output = await nilComputeOutput.executeAsync({ id: mpcResultId });
      setMpcResult(output?.Score?.toString());
      setProgress(2);
    } catch (error) {
      console.error("Error performing MPC:", error);
      setProgress(0); // Reset progress if there's an error
    }
  };

  return (
    <div
      style={{
        color: "black",
        marginTop: "1rem",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        <b>Find Common Connections Using MPC</b>
      </h1>
      <div
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "#f9f9f9",
        }}
      >
        <p>
          <strong>Store ID:</strong> {storeid || "Loading..."}
        </p>
        <p>
          <strong>Store ID 2:</strong> {storeid2 || "Loading..."}
        </p>
      </div>
      {progress === 0 && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={performMpc}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Perform MPC
          </button>
        </div>
      )}
      {progress === 1 && (
        <p style={{ textAlign: "center", color: "#FFA500" }}>
          <strong>Performing MPC...</strong>
        </p>
      )}
      {progress === 2 && (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            border: "1px solid #28a745",
            borderRadius: "8px",
            background: "#d4edda",
            color: "#155724",
          }}
        >
          <p>
            <strong>MPC Result:</strong> {mpcResult}
          </p>
        </div>
      )}
    </div>
  );
}

function stringTo48BitArray(str: string): bigint[] {
  const MAX_SIZE = 4;
  const CHUNK_SIZE = 6;

  if (str.length < MAX_SIZE * CHUNK_SIZE) {
    str = str.padEnd(MAX_SIZE * CHUNK_SIZE, "\0");
  } else if (str.length > MAX_SIZE * CHUNK_SIZE) {
    str = str.slice(0, MAX_SIZE * CHUNK_SIZE);
  }

  const chunks: bigint[] = [];
  for (let i = 0; i < str.length; i += CHUNK_SIZE) {
    const chunk = str.slice(i, i + CHUNK_SIZE);
    let bigIntValue = BigInt(0);
    for (let j = 0; j < chunk.length; j++) {
      bigIntValue = (bigIntValue << 8n) | BigInt(chunk.charCodeAt(j));
    }
    chunks.push(bigIntValue);
  }

  return chunks.slice(0, MAX_SIZE);
}

function convertArray(strArray: string[]): bigint[][] {
  return strArray.map((str) => stringTo48BitArray(str));
}
