"use client";

import React, { useState } from "react";
import { useNilFetchValue } from "@nillion/client-react-hooks";

export default function FetchValue() {
  const nilFetch = useNilFetchValue({
    type: "SecretString",
    staleAfter: 10000,
  });
  const [id, setId] = useState<string>("");
  const [names, setNames] = useState<string[] | null>(null);

  const handleClick = () => {
    if (!id) throw new Error("fetch-value: Id is required");
    nilFetch.execute({ id, name: "data" });
  };

  // Parse the fetched data as a list of names
  const displayFetchedNames = () => {
    if (nilFetch.isSuccess && nilFetch.data) {
      try {
        // @ts-ignore
        const parsedData = JSON.parse(nilFetch.data); // Convert JSON string to an array
        if (Array.isArray(parsedData)) {
          setNames(parsedData); // Set the names
        } else {
          throw new Error("Fetched data is not a valid array");
        }
      } catch (error) {
        console.error("Error parsing fetched data:", error);
      }
    }
  };

  // Call the display function whenever fetch is successful
  React.useEffect(() => {
    if (nilFetch.isSuccess) {
      displayFetchedNames();
    }
  }, [
    nilFetch.isSuccess,
    // @ts-ignore
    nilFetch.data,
  ]);

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-2">Fetch List of Names</h2>

      {/* Input to fetch stored value */}
      <input
        type="text"
        className="w-full p-2 mb-2 border border-gray-300 rounded text-black"
        placeholder="Store id"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      {/* Fetch Button */}
      <button
        className={`flex items-center justify-center w-40 px-4 py-2 mt-4 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 ${
          !id || nilFetch.isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleClick}
        disabled={!id || nilFetch.isLoading}
      >
        {nilFetch.isLoading ? (
          <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        ) : (
          <>Fetch</>
        )}
      </button>

      {/* Status and Names List */}
      <ul className="mt-4">
        <li className="mt-2">Status: {nilFetch.status}</li>
        <li className="mt-2">
          Secret:
          {nilFetch.isSuccess && names ? (
            <ul className="list-disc pl-4 mt-2">
              {names.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          ) : (
            "idle"
          )}
        </li>
      </ul>
    </div>
  );
}
