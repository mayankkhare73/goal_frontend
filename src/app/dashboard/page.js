'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only check authentication status
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  // Show loading while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00ffff] mx-auto"></div>
          <p className="mt-4 text-[#00ffff] text-lg">Initializing your Career Command Center...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#9370db]/20 max-w-md">
          <div className="text-[#00ffff] text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">Career Dashboard Temporarily Offline</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium cursor-pointer"
            >
              Reconnect to Career Hub
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-[#4b0082]/50 text-gray-300 px-6 py-3 rounded-lg hover:bg-[#4b0082]/70 transition-all duration-300 font-medium cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff]">
            Welcome, {session?.user?.name || (session?.user?.email ? session.user.email.split('@')[0] : 'User')}
            </h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-[#1a1a40]/80 backdrop-blur-lg text-gray-300 hover:text-[#00ffff] px-4 py-2 rounded-lg border border-[#9370db]/20 hover:border-[#9370db]/40 transition-all duration-300 text-sm flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#4b0082]/20 hover:border-[#4b0082]/40 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#4b0082]/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#4b0082]/40 transition-all duration-300">
                <svg className="w-6 h-6 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">AI Career Whisperer</h3>
              <p className="text-sm text-gray-400 mb-4">Describe your professional identity for AI-powered career insights</p>
              <Link
                href="/text-recommendations"
                className="w-full bg-[#4b0082]/30 text-[#9370db] px-6 py-3 rounded-lg hover:bg-[#4b0082]/40 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Discover Your Path
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#00ffff]/20 hover:border-[#00ffff]/40 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#00ffff]/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00ffff]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-[#00ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Career DNA Assessment</h3>
              <p className="text-sm text-gray-400 mb-4">Take our neural assessment to decode your ideal career match</p>
              <Link
                href="/quiz"
                className="w-full bg-[#00ffff]/20 text-[#00ffff] px-6 py-3 rounded-lg hover:bg-[#00ffff]/30 transition-all duration-300 font-medium shadow-lg hover:shadow-[#00ffff]/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Map Your Career DNA
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#9370db]/20 hover:border-[#9370db]/40 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#9370db]/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#9370db]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Career Journey Insights</h3>
              <p className="text-sm text-gray-400 mb-4">Explore your career assessment history and recommendation timeline</p>
              <Link
                href="/results"
                className="w-full bg-[#9370db]/20 text-[#9370db] px-6 py-3 rounded-lg hover:bg-[#9370db]/30 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Access Your Timeline
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#9370db]/20">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-4">Professional Growth Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.onetonline.org/" target="_blank" rel="noopener noreferrer" className="flex items-start p-2 rounded-lg hover:bg-[#9370db]/10 transition-all duration-300 cursor-pointer">
                  <div className="w-8 h-8 bg-[#9370db]/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                    </svg>
                  </div>
                          <div>
                    <h4 className="text-gray-300 font-medium text-sm">O*NET OnLine</h4>
                    <p className="text-gray-400 text-xs">Comprehensive database of job descriptions and requirements</p>
                  </div>
                </a>
              </li>
              <li>
                <a href="https://www.bls.gov/ooh/" target="_blank" rel="noopener noreferrer" className="flex items-start p-2 rounded-lg hover:bg-[#9370db]/10 transition-all duration-300 cursor-pointer">
                  <div className="w-8 h-8 bg-[#9370db]/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-gray-300 font-medium text-sm">Occupational Outlook Handbook</h4>
                    <p className="text-gray-400 text-xs">Career information with salary data and job outlook</p>
                          </div>
                </a>
              </li>
              <li>
                <a href="https://www.coursera.org/" target="_blank" rel="noopener noreferrer" className="flex items-start p-2 rounded-lg hover:bg-[#9370db]/10 transition-all duration-300 cursor-pointer">
                  <div className="w-8 h-8 bg-[#9370db]/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-gray-300 font-medium text-sm">Online Courses</h4>
                    <p className="text-gray-400 text-xs">Gain skills relevant to your career interests</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#00ffff]/20">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#9370db] mb-4">Career Development Events</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-10 h-10 bg-[#00ffff]/20 rounded-lg flex flex-col items-center justify-center mr-3">
                  <span className="text-xs font-semibold text-[#00ffff]">JUN</span>
                  <span className="text-sm font-bold text-[#00ffff]">15</span>
                </div>
                <div>
                  <h4 className="text-gray-300 font-medium text-sm">Virtual Career Fair</h4>
                  <p className="text-gray-400 text-xs mb-1">10:00 AM - 4:00 PM ET</p>
                  <a href="#" className="text-[#00ffff] text-xs font-medium hover:text-[#00ffff]/80 transition-colors duration-300 cursor-pointer">Register Now</a>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-10 h-10 bg-[#00ffff]/20 rounded-lg flex flex-col items-center justify-center mr-3">
                  <span className="text-xs font-semibold text-[#00ffff]">JUL</span>
                  <span className="text-sm font-bold text-[#00ffff]">08</span>
                </div>
                <div>
                  <h4 className="text-gray-300 font-medium text-sm">Resume Workshop</h4>
                  <p className="text-gray-400 text-xs mb-1">2:00 PM - 3:30 PM ET</p>
                  <a href="#" className="text-[#00ffff] text-xs font-medium hover:text-[#00ffff]/80 transition-colors duration-300 cursor-pointer">Learn More</a>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-10 h-10 bg-[#00ffff]/20 rounded-lg flex flex-col items-center justify-center mr-3">
                  <span className="text-xs font-semibold text-[#00ffff]">JUL</span>
                  <span className="text-sm font-bold text-[#00ffff]">22</span>
                </div>
                <div>
                  <h4 className="text-gray-300 font-medium text-sm">Interview Skills Webinar</h4>
                  <p className="text-gray-400 text-xs mb-1">1:00 PM - 2:30 PM ET</p>
                  <a href="#" className="text-[#00ffff] text-xs font-medium hover:text-[#00ffff]/80 transition-colors duration-300 cursor-pointer">Set Reminder</a>
                </div>
              </li>
            </ul>
            </div>

          <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#9370db]/20">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-4">Career Tips</h3>
            <ul className="space-y-4">
              <li className="pb-4 border-b border-gray-700/50">
                <h4 className="text-gray-300 font-medium text-sm mb-1">Resume Optimization</h4>
                <p className="text-gray-400 text-xs">Tailor your resume to include relevant keywords for each job application to pass ATS systems.</p>
              </li>
              <li className="pb-4 border-b border-gray-700/50">
                <h4 className="text-gray-300 font-medium text-sm mb-1">Networking Strategy</h4>
                <p className="text-gray-400 text-xs">Spend 30 minutes daily connecting with professionals in your desired field via LinkedIn.</p>
              </li>
              <li>
                <h4 className="text-gray-300 font-medium text-sm mb-1">Interview Preparation</h4>
                <p className="text-gray-400 text-xs">Research the company thoroughly and prepare specific examples that demonstrate your relevant skills.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 