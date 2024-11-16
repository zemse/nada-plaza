"use client";

import "./index.css";
import NFCScanner from "./components/NFCScanner";
import Footer from "./components/Footer";
import WalletComponent from "./components/WalletComponent";
import ConnectionSubmitter from "./components/ConnectionSubmitter";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function Home() {
  const { pkhash, pkhash2 } = useLocalStorage();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <NFCScanner />

          {pkhash ? <WalletComponent /> : null}

          {pkhash !== pkhash2 && pkhash2 === undefined ? (
            <ConnectionSubmitter />
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
