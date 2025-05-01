'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a40]/70 backdrop-blur-lg py-4 px-4 sm:px-6 border-t border-[#9370db]/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <div className="mb-4 md:mb-0">
          <p>© {currentYear} CareerPathfinder. All rights reserved.</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link 
            href="/terms" 
            className="text-gray-400 hover:text-[#00ffff] transition-colors duration-300 cursor-pointer"
          >
            Terms & Conditions
          </Link>
          <Link 
            href="/privacy" 
            className="text-gray-400 hover:text-[#00ffff] transition-colors duration-300 cursor-pointer"
          >
            Privacy Policy
          </Link>
          <a 
            href="mailto:support@careerpathfinder.com" 
            className="text-gray-400 hover:text-[#00ffff] transition-colors duration-300 cursor-pointer"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
} 