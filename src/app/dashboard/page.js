'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const dataFetchedRef = useRef(false);

  const fetchHistory = useCallback(async () => {
    try {
      // Check if user is authenticated
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      if (status === 'loading') {
        return; // Wait for session to load
      }

      setLoading(true);
      setError(null);
      
      // Log for debugging
      console.log('Fetching assessment history...');
      
      // Try the original endpoint first
      const response = await fetch('/api/assessment/history');

      // Log response status for debugging
      console.log('History API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch assessment history: ${response.status}`);
      }

      const data = await response.json();
      console.log('History data received:', data.history ? `${data.history.length} items` : 'no data');
      setHistory(data.history || []);
    } catch (error) {
      console.error('Dashboard error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [router, status]);

  useEffect(() => {
    if (!dataFetchedRef.current && status !== 'loading') {
      fetchHistory();
      dataFetchedRef.current = true;
    }
  }, [fetchHistory, status]);

  useEffect(() => {
    if (status === 'loading') {
      dataFetchedRef.current = false;
    }
    
    return () => {
      dataFetchedRef.current = false;
    };
  }, [status]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (assessmentId) => {
    // Navigate to the results page with the assessment ID
    router.push(`/results?assessmentId=${assessmentId}`);
  };

  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your assessment history...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-red-500/20 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={fetchHistory}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-700/50 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-700/70 transition-all duration-300 font-medium"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Your Dashboard
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-gray-800/50 backdrop-blur-lg text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all duration-300 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-all duration-300">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Text-Based Recommendations</h3>
              <p className="text-sm text-gray-400 mb-4">Describe your interests and get personalized career suggestions</p>
              <Link
                href="/text-recommendations"
                className="w-full bg-cyan-500/20 text-cyan-400 px-6 py-3 rounded-lg hover:bg-cyan-500/30 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20 text-sm flex items-center justify-center gap-2"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Interactive Quiz</h3>
              <p className="text-sm text-gray-400 mb-4">Answer questions to discover careers that match your personality</p>
              <Link
                href="/quiz"
                className="w-full bg-purple-500/20 text-purple-400 px-6 py-3 rounded-lg hover:bg-purple-500/30 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20 text-sm flex items-center justify-center gap-2"
              >
                Start Quiz
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 border border-cyan-500/20">
              <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                Your Recent Assessments
              </h2>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {paginatedHistory.map((assessment) => (
                    <div key={assessment._id} className="bg-gray-700/50 rounded-lg p-4 border border-cyan-500/20">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-300">
                              {assessment.type === 'quiz' ? 'Quiz Assessment' : 'Text-Based Assessment'}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {formatDate(assessment.date)}
                            </p>
                          </div>
                          <Link
                            href={`/results?assessmentId=${assessment._id}`}
                            className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-all duration-300 text-sm"
                          >
                            View Results
                          </Link>
                        </div>
                        
                        {/* Recommended Profile Section */}
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-cyan-400 mb-1">Recommended Profile</h4>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-gray-300 font-medium">
                              {assessment.recommendations[0]?.title || 'No recommendation available'}
                            </p>
                            {assessment.recommendations[0]?.match_score && (
                              <p className="text-sm text-cyan-400 mt-1">
                                Match Score: {(assessment.recommendations[0].match_score * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Sector Distribution Section */}
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-cyan-400 mb-1">Sector Distribution</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(
                              assessment.recommendations.reduce((acc, rec) => {
                                const sector = rec.sector || 'Other';
                                acc[sector] = (acc[sector] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([sector, count]) => (
                              <div key={sector} className="bg-gray-800/50 rounded-lg p-2 text-center">
                                <p className="text-sm text-gray-300">{sector}</p>
                                <p className="text-xs text-cyan-400">{count} careers</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">No assessment history found.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                      href="/quiz"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20 text-sm"
                    >
                      Take Quiz
                    </Link>
                    <Link
                      href="/text-recommendations"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20 text-sm"
                    >
                      Get Text Recommendations
                    </Link>
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {history.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/70 transition-all duration-300"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/70 transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 border border-cyan-500/20">
              <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                Career Insights
              </h2>
              {history.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Top Career Matches</h3>
                    <div className="space-y-2">
                      {history.slice(0, 3).map((assessment, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-cyan-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{assessment.recommendations[0].title}</span>
                            <span className="text-cyan-400 text-sm">
                              {(assessment.recommendations[0].match_score * 100).toFixed(0)}% match
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Sector Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        history.reduce((acc, assessment) => {
                          const sector = assessment.recommendations[0].sector || 'Other';
                          acc[sector] = (acc[sector] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([sector, count]) => (
                        <div key={sector} className="bg-gray-700/50 rounded-lg p-3 border border-cyan-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{sector}</span>
                            <span className="text-cyan-400 text-sm">{count} careers</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    Complete an assessment to see your career insights and recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 