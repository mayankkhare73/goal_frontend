'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PrivacyPolicy() {
  const [formattedDate, setFormattedDate] = useState('');
  
  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString());
  }, []);
  
  return (
    <div className="min-h-screen gradient-hero py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#9370db]/20">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-6">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-gray-300">
          <p>Last Updated: {formattedDate}</p>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
            <p>CareerPathfinder (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our career assessment and recommendation platform.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
            <p>We collect information you provide directly to us when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account (name, email, password)</li>
              <li>Complete career assessments and quizzes</li>
              <li>Provide information about your education, skills, and preferences</li>
              <li>Interact with our platform features</li>
            </ul>
            <p className="mt-2">We also automatically collect certain information about your device and how you interact with our platform, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage information (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generate personalized career recommendations</li>
              <li>Create and maintain your account</li>
              <li>Communicate with you about our services</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Career Recommendations Disclaimer</h2>
            <p>Our AI-powered career recommendations system processes your assessment data to suggest potential career paths. Please note:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Our suggestions are based solely on the information you provide during the assessment</li>
              <li>Results are algorithmic in nature and not a guarantee of suitability or success</li>
              <li>We do not share your specific career assessment results with third parties without your consent</li>
              <li>You maintain full autonomy in your career choices regardless of our suggestions</li>
              <li>We do not track or monitor your actual career decisions following our recommendations</li>
            </ul>
            <p className="mt-2 text-amber-400">We encourage users to treat our recommendations as one of many tools in their career decision-making process.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Sharing Your Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who perform services on our behalf</li>
              <li>Professional advisors (lawyers, accountants, insurers)</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>
            <p className="mt-2">We do not sell your personal information to third parties.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information. However, no electronic transmission or storage system is 100% secure, and we cannot guarantee absolute security.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Your Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accessing your personal information</li>
              <li>Correcting inaccurate information</li>
              <li>Deleting your information</li>
              <li>Restricting or objecting to processing</li>
              <li>Data portability</li>
              <li>Withdrawing consent</li>
            </ul>
            <p className="mt-2">To exercise these rights, please contact us using the information in the &quot;Contact Us&quot; section.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Children&apos;s Privacy</h2>
            <p>Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@careerpathfinder.com</p>
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