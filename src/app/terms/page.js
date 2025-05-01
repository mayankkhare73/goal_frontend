'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TermsAndConditions() {
  const [formattedDate, setFormattedDate] = useState('');
  
  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString());
  }, []);
  
  return (
    <div className="min-h-screen gradient-hero py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#9370db]/20">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-6">
          Terms and Conditions
        </h1>
        
        <div className="space-y-6 text-gray-300">
          <p>Last Updated: {formattedDate}</p>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>By accessing or using CareerPathfinder, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access the service.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
            <p>CareerPathfinder provides career recommendation and assessment services. Our platform uses AI to analyze your preferences and interests to suggest potential career paths.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. User Accounts</h2>
            <p>To access certain features of the service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. User Data</h2>
            <p>We collect and process your data as described in our <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300 cursor-pointer">Privacy Policy</Link>. By using our service, you consent to such processing.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Career Recommendations</h2>
            <p>The career recommendations provided are for informational purposes only. Our AI-generated suggestions are based on the information you provide and should not be considered as professional career advice.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Intellectual Property</h2>
            <p>All content, features, and functionality of CareerPathfinder, including but not limited to text, graphics, logos, and code, are the exclusive property of CareerPathfinder and are protected by copyright, trademark, and other intellectual property laws.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
            <p>CareerPathfinder and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the service.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will provide notice of any material changes by updating the "Last Updated" date. Your continued use of the service after such modifications constitutes your acceptance of the revised terms.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which our company is registered, without regard to its conflict of law provisions.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at support@careerpathfinder.com</p>
          </section>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="gradient-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 