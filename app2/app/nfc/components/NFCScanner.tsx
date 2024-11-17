import { Scan } from "lucide-react";
import { useState } from "react";
import NFCDataDisplay from "./NFCDataDisplay";
import WalletComponent from "./WalletComponent";
import ConnectionSubmitter from "./ConnectionSubmitter";
import { useLocalStorage } from "../hooks/useLocalStorage";
import MpcComponent from "./MpcComponent";

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
  // let val_garry = {
  //   serialNumber: "bf:a5:0e:28",
  //   records: [
  //     {
  //       recordType: "url",
  //       data: "https://nfc.ethglobal.com/?av=A02.03.000001.D1D87DFE&v=01.G1.000005.2BD427BC&pk1=04E5F2EBA3C08694A541F8094C8065E5B43DB97C2BEE4CDB947BAFA8AA4AFE7B6836EF7AF322D142DF4555A10B12A07345C59FB0A9EF443C969C3526C94C94F4E5&latch1=A978F410877F3140D9CF66E0F4EC2D5061BBEB19E94FDD99D421D3ECB660B1CE&cmd=0000&res=00",
  //     },
  //   ],
  //   timestamp: "11/17/2024, 3:31:27 AM",
  // };

  let val_saurav = {
    serialNumber: "bf:d7:0d:28",
    records: [
      {
        recordType: "url",
        data: "https://nfc.ethglobal.com/?av=A02.03.000001.D1D87DFE&v=01.G1.000005.2BD427BC&pk1=04034414C24D036EC44F46D093885FB7C5494FEDFAD284B77F021B264F2942AAAE4BDC4E6FCC547F906FAC0E2126E4D672FCBFF6D5CC5877D53FE903A08CF82D68&latch1=74C578821766E9DC6D73E02F2BDE4C827DBED198F82A80B623A37C3057ECE6A5&cmd=0000&res=00",
      },
    ],
    timestamp: "11/17/2024, 6:38:04 AM",
  };

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<NFCData | null>(val_saurav);

  const parseNDEFMessage = (message: any) => {
    return Array.from(message.records).map((record: any) => {
      const recordData: any = {};
      recordData.recordType = record.recordType;

      if (record.recordType === "text") {
        const textDecoder = new TextDecoder(record.encoding);
        recordData.data = textDecoder.decode(record.data);
        recordData.encoding = record.encoding;
        recordData.lang = record.lang;
      } else if (record.recordType === "url") {
        const textDecoder = new TextDecoder();
        recordData.data = textDecoder.decode(record.data);
      } else {
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
        let obj = {
          serialNumber,
          records,
          timestamp: new Date().toLocaleString(),
        };
        console.log(obj);
        setScannedData(obj);
        setScanning(false);
      });
    } catch (err) {
      setError("Error accessing NFC: " + (err as Error).message);
      setScanning(false);
    }
  };

  const { pkhash, pkhash2 } = useLocalStorage();

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 min-h-screen bg-gray-100">
      {!scannedData && (
        <button
          onClick={startScanning}
          disabled={scanning}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-white font-semibold text-lg transition-all transform hover:scale-105 ${
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
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded-lg mt-4 text-center">
          {error}
        </div>
      )}

      {!scannedData && (
        <div className="text-gray-600 text-center max-w-md px-4 mt-4">
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

      {pkhash ? <WalletComponent /> : null}

      {pkhash !== pkhash2 && pkhash2 === undefined ? (
        <ConnectionSubmitter />
      ) : null}

      {pkhash !== pkhash2 && pkhash2 !== undefined ? <MpcComponent /> : null}
    </div>
  );
}
