import "./index.css";
import NFCScanner from "./components/NFCScanner";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <NFCScanner />
        </div>
      </main>
      <Footer />
    </div>
  );
}
