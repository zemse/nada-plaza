import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NFCScanner from './components/NFCScanner';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="min-h-[60vh] flex items-center justify-center">
                <NFCScanner />
              </div>
            } />
            <Route path="/history" element={
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Scan History</h1>
                <p className="text-gray-600">Your scan history will appear here.</p>
              </div>
            } />
            <Route path="/about" element={
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">About NFC Scanner</h1>
                <p className="text-gray-600">
                  This web application allows you to scan NFC tags using your device's built-in NFC reader.
                  Simply tap the scan button and hold an NFC tag near your device to read its contents.
                </p>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;