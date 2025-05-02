'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Disclaimer() {
  const [formattedDate, setFormattedDate] = useState('');
  
  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString());
  }, []);
  
  return (
    <div className="min-h-screen gradient-hero py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#9370db]/20">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-6">
          Career Recommendations Disclaimer
        </h1>
        
        <div className="space-y-6 text-gray-300">
          <p>Last Updated: {formattedDate}</p>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Nature of Career Recommendations</h2>
            <p>The career recommendations provided by CareerPathfinder are generated using artificial intelligence based solely on the information you provide through our assessments. These recommendations are intended to be informative and suggestive rather than definitive or prescriptive.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Limitations of Our Recommendations</h2>
            <p>While we strive to provide valuable insights, you should be aware of the following limitations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our AI analyzes only the data you provide during the assessment</li>
              <li>Recommendations do not account for job market conditions, local availability, or economic factors</li>
              <li>The platform cannot assess your actual job performance capabilities</li>
              <li>Results may vary based on the completeness and accuracy of your inputs</li>
              <li>Career recommendations are not guarantees of success, satisfaction, or employment</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Your Career Autonomy</h2>
            <p className="text-amber-400 font-medium">You retain complete freedom and responsibility in your career decisions.</p>
            <p>Our recommendations should be considered as one of many tools in your career exploration process. We strongly encourage you to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conduct additional research on recommended career paths</li>
              <li>Consider your personal circumstances, goals, and values</li>
              <li>Evaluate external factors like job market demand and economic trends</li>
              <li>Consult with professional career counselors for personalized advice</li>
              <li>Speak with professionals working in fields of interest</li>
              <li>Reflect on your own experiences and preferences</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. No Guarantee of Success</h2>
            <p>CareerPathfinder expressly disclaims any guarantee of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Employment or job placement in any field</li>
              <li>Income levels or financial outcomes</li>
              <li>Career satisfaction or success</li>
              <li>Qualification for positions without proper education or credentials</li>
              <li>Accuracy of specific industry or career details</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Educational Purposes Only</h2>
            <p>The information provided through CareerPathfinder is for educational and informational purposes only. It is not intended to replace professional career counseling, academic advising, or job placement services.</p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Use of Your Assessment Data</h2>
            <p>We use your assessment data solely to generate personalized recommendations and improve our service. We do not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Share your specific assessment results with employers</li>
              <li>Guarantee job placement based on your results</li>
              <li>Track or monitor your actual career decisions</li>
              <li>Use your data to limit your career options</li>
            </ul>
            <p>For more details on how we handle your data, please refer to our <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300">Privacy Policy</Link>.</p>
          </section>
          
          <section className="space-y-3 bg-[#1a1a40]/50 backdrop-blur-sm border border-[#9370db]/30 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-amber-400">Summary</h2>
            <p>CareerPathfinder&apos;s AI-powered recommendations are based solely on your assessment inputs. These suggestions are informational only and not promises or guarantees of any specific career outcome. You remain completely free to choose your own career path based on your personal circumstances, preferences, and opportunities. We strongly recommend consulting with professional career counselors for important career decisions.</p>
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