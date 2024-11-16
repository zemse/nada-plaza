"use client";

import { Scan } from "lucide-react";
import { useState } from "react";
import NFCDataDisplay from "./NFCDataDisplay";

interface NFCData {
  serialNumber: string;
  records: Array<{
    recordType: string;
    data: string;
    encoding?: string;
    lang?: string;
  }>;
  timestamp: string;
}

export default function NFCScanner() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<NFCData | null>(null);

  const parseNDEFMessage = (message: any) => {
    return Array.from(message.records).map((record: any) => {
      const recordData: any = {};
      recordData.recordType = record.recordType;

      // Parse different types of records
      if (record.recordType === "text") {
        const textDecoder = new TextDecoder(record.encoding);
        recordData.data = textDecoder.decode(record.data);
        recordData.encoding = record.encoding;
        recordData.lang = record.lang;
      } else if (record.recordType === "url") {
        const textDecoder = new TextDecoder();
        recordData.data = textDecoder.decode(record.data);
      } else {
        // For other types, convert to hex string
        recordData.data = Array.from(new Uint8Array(record.data))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      }

      return recordData;
    });
  };

  const startScanning = async () => {
    if (!("NDEFReader" in window)) {
      setError("NFC is not supported on this device");
      return;
    }

    try {
      setScanning(true);
      setError(null);
      setScannedData(null);

      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        const records = parseNDEFMessage(message);
        setScannedData({
          serialNumber,
          records,
          timestamp: new Date().toLocaleString(),
        });
        setScanning(false);
      });
    } catch (err) {
      setError("Error accessing NFC: " + (err as Error).message);
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto">
      {!scannedData && (
        <button
          onClick={startScanning}
          disabled={scanning}
          className={`flex items-center space-x-2 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all transform hover:scale-105 ${
            scanning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          <Scan className={`h-6 w-6 ${scanning ? "animate-pulse" : ""}`} />
          <span>{scanning ? "Scanning..." : "Scan NFC Tag"}</span>
        </button>
      )}

      {error && (
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {!scannedData && (
        <div className="text-gray-600 text-center max-w-md px-4">
          {scanning ? (
            <p>Please hold your NFC tag near the device...</p>
          ) : (
            <p>
              Tap the button and hold an NFC tag near your device to scan it.
            </p>
          )}
        </div>
      )}

      {scannedData && (
        <NFCDataDisplay
          data={scannedData}
          onClose={() => setScannedData(null)}
        />
      )}
    </div>
  );
}
