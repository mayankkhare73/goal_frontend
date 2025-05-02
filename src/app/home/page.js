'use client';

// Force dynamic rendering to prevent Vercel build issues
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  
  useEffect(() => {
    setIsClient(true);
    
    // Redirect logged-in users to dashboard
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);
  
  // If user is authenticated, don't render the home page content
  if (session) {
    return <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffff]"></div>
    </div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a40] to-[#2a2a60]">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:space-x-12">
            <div className="md:w-1/2 z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-6">
                Discover Your Perfect Career Path
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Our AI-powered assessment analyzes your unique skills, interests, and values to recommend careers that truly match who you are.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/signup" 
                  className="gradient-primary text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300 text-lg"
                >
                  Get Started Free
                </Link>
                <Link 
                  href="/login" 
                  className="bg-transparent border-2 border-emerald-500/30 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-500/10 transition-all duration-300 text-lg"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required • Free personalized report
              </div>
            </div>
            {isClient && (
              <div className="md:w-1/2 mt-12 md:mt-0 relative">
                <div className="bg-[#3a3a80]/50 backdrop-blur-sm border border-[#9370db]/20 rounded-2xl p-6 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="relative w-full h-[300px]">
                    <Image 
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                      alt="Career Assessment" 
                      className="rounded-lg shadow-lg object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="mt-4 bg-[#2a2a60]/80 backdrop-blur-sm rounded-lg p-4 border border-[#9370db]/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-emerald-400 font-semibold">Career Match Results</div>
                      <div className="text-xs text-gray-400">5 min ago</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Data Scientist</span>
                        <div className="w-1/2 bg-gray-700/50 rounded-full h-2">
                          <div className="bg-gradient-to-r from-emerald-500 to-[#00ffff] h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                        <span className="text-gray-300 font-medium">92%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">UX Designer</span>
                        <div className="w-1/2 bg-gray-700/50 rounded-full h-2">
                          <div className="bg-gradient-to-r from-emerald-500 to-[#00ffff] h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                        <span className="text-gray-300 font-medium">87%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Product Manager</span>
                        <div className="w-1/2 bg-gray-700/50 rounded-full h-2">
                          <div className="bg-gradient-to-r from-emerald-500 to-[#00ffff] h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-gray-300 font-medium">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-[#2a2a60]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-4">
              How CareerPathfinder Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our advanced AI algorithm analyzes multiple factors to find your perfect career match
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#3a3a80]/30 backdrop-blur-sm border border-[#9370db]/20 rounded-xl p-6 shadow-lg hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Take The Career Quiz</h3>
              <p className="text-gray-300">
                Answer questions about your skills, interests, work style, and values in our comprehensive yet quick assessment.
              </p>
            </div>
            
            <div className="bg-[#3a3a80]/30 backdrop-blur-sm border border-[#9370db]/20 rounded-xl p-6 shadow-lg hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-300">
                Our machine learning algorithm processes your responses to identify patterns and match them to successful career profiles.
              </p>
            </div>
            
            <div className="bg-[#3a3a80]/30 backdrop-blur-sm border border-[#9370db]/20 rounded-xl p-6 shadow-lg hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-red-500 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Your Results</h3>
              <p className="text-gray-300">
                Receive personalized career recommendations with detailed insights on why they match your profile and how to pursue them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2a2a60] to-[#1a1a40]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Discover Your Ideal Career Path?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands who have found career clarity and purpose with our AI-powered assessment tool
          </p>
          
          {/* Disclaimer Note */}
          <div className="bg-[#1a1a40]/50 backdrop-blur-sm border border-[#9370db]/30 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <p className="text-sm text-gray-400 italic">
              <span className="text-emerald-400 font-medium">Disclaimer:</span> All career recommendations provided are based solely on your assessment inputs and our AI analysis. 
              These suggestions are meant to be informative rather than prescriptive. 
              You remain free to choose your own career path based on your personal circumstances, preferences, and opportunities.
            </p>
          </div>
          
          <Link 
            href="/signup" 
            className="gradient-primary text-white px-8 py-4 rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300 text-lg inline-block"
          >
            Start Your Free Assessment
          </Link>
          <p className="mt-4 text-gray-400">No commitment required • Only takes 5-10 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a40] py-12 border-t border-[#9370db]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-4">
                CareerPathfinder
              </h3>
              <p className="text-gray-400">
                AI-powered career discovery platform helping you find your perfect professional match.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup" className="hover:text-emerald-400 transition-colors">Get Started</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Career Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Industry Guides</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CareerPathfinder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 