import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
  ProgramId,
  StoreId,
} from "@nillion/client-core";

// const base = "http://localhost:3005";
const base = "https://api.nadaplaza.bytes31.com";

export default function MpcComponent() {
  const { pkhash, pkhash2 } = useLocalStorage();

  // program for MPC intersection between 10 items
  const programid =
    "615UmdBm3vxJF9k44bF97Va1Eg8JjyNeRJ1pxr1qY5NivmFZAWN4zrbUVfMnXny5MA4dmPb6cYrPRAiW6AzaPPSx/main";
  const [storeid, setStoreid] = useState<string>();
  const [storeid2, setStoreid2] = useState<string>();
  const [mpcResult, setMpcResult] = useState<string>();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const result = await axios.get(`${base}/get-storeid?uid=${pkhash}`);
      console.log("storeid", result.data);
      setStoreid(result.data.storeid);
    })();
  }, [pkhash]);

  useEffect(() => {
    (async () => {
      const result = await axios.get(`${base}/get-storeid?uid=${pkhash2}`);
      console.log("storeid2", result.data);
      setStoreid2(result.data.storeid);
    })();
  }, [pkhash2]);

  const { client } = useNillion();
  const nilCompute = useNilCompute();
  const nilFetch = useNilFetchValue({
    type: "SecretString",
    staleAfter: 10000,
  });
  const nilComputeOutput = useNilComputeOutput();

  const perform_mpc = () => {
    if (!storeid || !storeid2) return;

    setProgress(1);

    (async () => {
      const bindings = ProgramBindings.create(programid)
        .addInputParty(PartyName.parse("data_owner1"), client.partyId)
        .addInputParty(PartyName.parse("data_owner2"), client.partyId)
        .addOutputParty(PartyName.parse("data_owner1"), client.partyId);

      let selfData = await nilFetch.executeAsync({
        id: storeid,
        name: "data",
      });
      let otherData = await nilFetch.executeAsync({
        id: storeid2,
        name: "data",
      });

      const selfDataValue = convertArray(JSON.parse(selfData as any));
      const otherDataValue = convertArray(JSON.parse(otherData as any));

      const values = NadaValues.create();

      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 4; j++) {
          console.log("NadaValue", selfDataValue[i][j]);
          console.log(
            "NamedValue.parse",
            NamedValue.parse("num1_" + i + "_" + j),
          );
          console.log(
            "NadaValue.createSecretInteger",
            NadaValue.createSecretInteger(
              Number(selfDataValue[i][j].toString()),
            ),
          );

          values.insert(
            NamedValue.parse("num1_" + i + "_" + j),
            NadaValue.createSecretInteger(
              Number(selfDataValue[i][j].toString()),
            ),
          );
          console.log("this itr done");
        }
      }

      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 4; j++) {
          console.log("NadaValue", otherDataValue[i][j]);
          console.log(
            "NamedValue.parse",
            NamedValue.parse("num1_" + i + "_" + j),
          );
          console.log(
            "NadaValue.createSecretInteger",
            NadaValue.createSecretInteger(
              Number(otherDataValue[i][j].toString()),
            ),
          );

          values.insert(
            NamedValue.parse("num2_" + i + "_" + j),
            NadaValue.createSecretInteger(
              Number(otherDataValue[i][j].toString()),
            ),
          );
          console.log("this itr done");
        }
      }

      const mpc_result = await nilCompute.executeAsync({ bindings, values });
      console.log("mpc result", mpc_result);

      const output = await nilComputeOutput.executeAsync({ id: mpc_result });
      console.log(output);
      setMpcResult((output as any).Score.toString());
      setProgress(2);
    })();
  };

  return (
    <div style={{ color: "black" }}>
      <h1>Find number of common connections using MPC:</h1>
      <p>Store ID: {storeid}</p>
      <p>Store ID 2: {storeid2}</p>
      {progress === 0 ? (
        <div
          className="text-green-600 bg-green-100 border border-green-300 rounded-md py-2 px-4 text-center max-w-sm mx-auto"
          style={{ fontWeight: "bold" }}
        >
          <button onClick={perform_mpc}>Perform MPC</button>
        </div>
      ) : null}
      {progress === 1 ? <p>Performing MPC...</p> : null}
      {progress === 2 ? <p>MPC Result: {mpcResult}</p> : null}
    </div>
  );
}

function stringTo48BitArray(str: string): bigint[] {
  const MAX_SIZE = 4;
  const CHUNK_SIZE = 6; // 64 bits = 8 bytes = 8 characters (assuming 1 char = 1 byte in ASCII)

  // Pad or truncate the string to ensure it is the right size
  if (str.length < MAX_SIZE * CHUNK_SIZE) {
    str = str.padEnd(MAX_SIZE * CHUNK_SIZE, "\0"); // Pad with null characters
  } else if (str.length > MAX_SIZE * CHUNK_SIZE) {
    str = str.slice(0, MAX_SIZE * CHUNK_SIZE); // Truncate to fit
  }

  // Split into chunks of 8 characters and convert to 64-bit integers
  const chunks: bigint[] = [];
  for (let i = 0; i < str.length; i += CHUNK_SIZE) {
    const chunk = str.slice(i, i + CHUNK_SIZE);
    let bigIntValue = BigInt(0);

    // Convert chunk to a bigint by combining character codes
    for (let j = 0; j < chunk.length; j++) {
      bigIntValue = (bigIntValue << 8n) | BigInt(chunk.charCodeAt(j));
    }

    chunks.push(bigIntValue);
  }

  return chunks.slice(0, MAX_SIZE); // Ensure size is exactly 3
}

function convertArray(strArray: string[]): bigint[][] {
  return strArray.map((str) => stringTo48BitArray(str));
}
