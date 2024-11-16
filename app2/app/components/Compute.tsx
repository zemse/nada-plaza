"use client";

import { type FC, useState } from "react";
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
  StoreId,
} from "@nillion/client-core";
import { useNilCompute, useNillion,useNilFetchValue } from "@nillion/client-react-hooks";

const stringTo48BitArray = (str: string): bigint[] => {
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
};

const convertArray = (strArray: string[]): bigint[][] => {
  return strArray.map((str) => stringTo48BitArray(str));
};


export const Compute: FC = () => {
  const { client } = useNillion();
  const nilCompute = useNilCompute();
  const [programId, setProgramId] = useState<ProgramId | string>("");
  const [storeIdSelf, setStoreIdSelf] = useState<StoreId | string>("");
  const [storeIdOther, setStoreIdOther] = useState<StoreId | string>("");
  const [copiedComputeOutputID, setCopiedComputeOutputID] = useState(false);

  const nilFetch = useNilFetchValue({
    type: "SecretString",
    staleAfter: 10000,
  });

  const handleClick = async() => {
    console.log("inside handleClick")
    if (!programId) throw new Error("compute: program id required");

    const bindings = ProgramBindings.create(programId)
      .addInputParty(PartyName.parse("data_owner1"), client.partyId)
      .addInputParty(PartyName.parse("data_owner2"), client.partyId)
      .addOutputParty(PartyName.parse("data_owner1"), client.partyId);

    // TODO: remove this. this is ony for testing
    // let id = window.localStorage.getItem('id') as string;
    // console.log("id", id);
    console.log("binding done", bindings);
    
    let selfData = await nilFetch.executeAsync({ id: storeIdSelf, name: "data" });
    let otherData = await nilFetch.executeAsync({ id: storeIdOther, name: "data" });

    console.log("selfData", selfData);
    console.log("otherData", otherData);

    const selfDataValue = convertArray(JSON.parse((selfData as any)));
    const otherDataValue = convertArray(JSON.parse((otherData as any)));

    // for (let i = 0; i < 10; i++) {
    //   for (let j = 0; j < 3; j++) {
    //     value.push((output as bigint[][])[i][j]);
    //   }
    // }
    // console.log(result);

    // // TODO: remove this. this is ony for testing
    // const output = convertArray(result as string[]);
    // console.log(output);
    // const strings = convertBackToStringArray(output);
    // console.log(strings);
    const values = NadaValues.create();

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 4; j++) {
        console.log("NadaValue", selfDataValue[i][j]);
        console.log("NamedValue.parse", NamedValue.parse("num1_" + i + "_" + j));
        console.log("NadaValue.createSecretInteger", NadaValue.createSecretInteger(Number(selfDataValue[i][j].toString())));

        values.insert(
          NamedValue.parse("num1_" + i + "_" + j),
          NadaValue.createSecretInteger(Number(selfDataValue[i][j].toString()))
        );
        console.log("this itr done");
      }
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 4; j++) {
        console.log("NadaValue", otherDataValue[i][j]);
        console.log("NamedValue.parse", NamedValue.parse("num1_" + i + "_" + j));
        console.log("NadaValue.createSecretInteger", NadaValue.createSecretInteger(Number(otherDataValue[i][j].toString())));

        values.insert(
          NamedValue.parse("num2_" + i + "_" + j),
          NadaValue.createSecretInteger(Number(otherDataValue[i][j].toString()))
        );
        console.log("this itr done");
      }
    }

    nilCompute.executeAsync({ bindings, values });
  };

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Compute</h2>
      <input
        className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
        placeholder="Program id"
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
        placeholder="StoreId self"
        value={storeIdSelf}
        onChange={(e) => setStoreIdSelf(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
        placeholder="StoreId other"
        value={storeIdOther}
        onChange={(e) => setStoreIdOther(e.target.value)}
      />
      <button
        className={`flex items-center justify-center px-4 py-2 border rounded text-black mb-4 ${
          nilCompute.isLoading || !programId
            ? "opacity-50 cursor-not-allowed bg-gray-200"
            : "bg-white hover:bg-gray-100"
        }`}
        onClick={handleClick}
        disabled={nilCompute.isLoading || !programId}
      >
        {nilCompute.isLoading ? (
          <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        ) : (
          "Compute"
        )}
      </button>
      <p className="my-2 italic text-sm mt-2">
        Current values are 4 & 2. Refer to ComputeOutput.tsx
      </p>
      <ul className="list-disc pl-5 mt-4">
        <li className="mt-2">Status: {nilCompute.status}</li>
        <li className="mt-2">
          Compute output id:
          {nilCompute.isSuccess ? (
            <>
              {`${nilCompute.data?.substring(0, 4)}...${nilCompute.data?.substring(nilCompute.data.length - 4)}`}
              <button
                onClick={() => {
                  setCopiedComputeOutputID(true);
                  navigator.clipboard.writeText(nilCompute.data);
                  setTimeout(() => setCopiedComputeOutputID(false), 2000);
                }}
              >
                {!copiedComputeOutputID ? " 📋" : " ✅"}
              </button>
            </>
          ) : (
            "idle"
          )}
        </li>
      </ul>
    </div>
  );



  async function fetchData(storeId: string): Promise<string[]> {
    nilFetch.executeAsync({ id: storeId, name: "data" });

    return await new Promise(res => {
      let interval_id =  setInterval(() => {
         if (nilFetch.isSuccess && nilFetch.data) {
           try {
             // @ts-ignore
             const parsedData: string[] = JSON.parse(nilFetch.data); // Convert JSON string to an array
             if (Array.isArray(parsedData)) {
               res(parsedData); // Set the names
               clearInterval(interval_id)
             } else {
               throw new Error("Fetched data is not a valid array");
             }
           } catch (error) {
             console.error("Error parsing fetched data:", error);
           }
           
         }
       }, 50);
     });
   }
};
