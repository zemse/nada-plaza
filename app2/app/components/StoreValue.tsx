"use client";

import React, { useState } from "react";
import { useNilStoreValue } from "@nillion/client-react-hooks";

export default function StoreValue() {
  const nilStore = useNilStoreValue();
  const [names, setNames] = useState<string[]>([]); // Store a list of names
  const [newName, setNewName] = useState<string>(""); // Input for new name
  const [copied, setCopied] = useState(false);

  const handleAddName = () => {
    if (newName.trim() === "") return;
    setNames((prevNames) => [...prevNames, newName.trim()]); // Add new name to the list
    setNewName(""); // Clear the input field
  };

  const handleClick = () => {
    if (names.length === 0) throw new Error("store-value: Value required");
    const namesData = JSON.stringify(names); // Convert the list of names to a string
    nilStore.execute({ name: "data", data: namesData, ttl: 1 });
  };

  return (
    <div className="border border-gray-400 rounded-lg p-4 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-2">Store List of Names</h2>

      {/* Input for adding a new name */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter a name"
          className="w-full p-2 border border-gray-300 rounded text-black"
        />
        <button
          onClick={handleAddName}
          className="ml-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200"
        >
          Add
        </button>
      </div>

      {/* Display the list of names */}
      {names.length > 0 && (
        <ul className="list-disc pl-4 mb-4">
          {names.map((name, index) => (
            <li key={index} className="mt-1">
              {name}
            </li>
          ))}
        </ul>
      )}

      {/* Button to Store the Names */}
      <button
        className={`flex items-center justify-center w-40 px-4 py-2 mt-4 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 ${
          names.length === 0 || nilStore.isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleClick}
        disabled={names.length === 0 || nilStore.isLoading}
      >
        {nilStore.isLoading ? (
          <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        ) : (
          <>Store</>
        )}
      </button>

      <ul className="mt-4">
        <li className="mt-2">Status: {nilStore.status}</li>
        <li className="mt-2">
          Id:
          {nilStore.isSuccess ? (
            <>
              {`${nilStore.data?.substring(0, 6)}...${nilStore.data?.substring(
                nilStore.data.length - 6
              )}`}
              <button
                onClick={() => {
                  setCopied(true);

                  // Store in window.localStorage
                  if (nilStore.data) {
                    window.localStorage.setItem('id', nilStore.data);
                  }
                  navigator.clipboard.writeText(nilStore.data);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {!copied ? " 📋" : " ✅"}
              </button>
            </>
          ) : (
            "idle"
          )}
        </li>
      </ul>
    </div>
  );
}