import { Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm">
            © {new Date().getFullYear()} NFC Scanner. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a
              href="https://twitter.com"
              className="text-gray-600 hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com"
              className="text-gray-600 hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}