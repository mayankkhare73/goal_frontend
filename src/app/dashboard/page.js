'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/assessment/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch assessment history');
        }

        const data = await response.json();
        setHistory(data.history);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your assessment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Your Dashboard
          </h1>
          <div className="space-x-4">
            <Link
              href="/text-recommendations"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20"
            >
              Get Text-Based Recommendations
            </Link>
            <Link
              href="/quiz"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20"
            >
              Take Quiz
            </Link>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-cyan-500/20">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                No Assessment History Found
              </h2>
              <p className="text-gray-300 mb-6">
                Start your career discovery journey by taking our interactive quiz or getting text-based recommendations.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/quiz"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20"
                >
                  Take Quiz
                </Link>
                <Link
                  href="/text-recommendations"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20"
                >
                  Get Text Recommendations
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {history.map((assessment, index) => (
              <div 
                key={assessment._id} 
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/20 border border-cyan-500/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      Assessment #{history.length - index}
                    </h2>
                    <p className="text-gray-400 mt-2">
                      {formatDate(assessment.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(assessment._id)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20"
                  >
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-700/50 p-6 rounded-lg border border-cyan-500/20">
                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                      Top Recommendations
                    </h3>
                    <ul className="space-y-4">
                      {assessment.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="flex items-center">
                          <span className="w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                            {i + 1}
                          </span>
                          <span className="text-gray-300">{rec.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-700/50 p-6 rounded-lg border border-blue-500/20">
                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                      Sector Distribution
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(
                        assessment.recommendations.reduce((acc, rec) => {
                          const sector = rec.sector || 'Other';
                          acc[sector] = (acc[sector] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([sector, count]) => (
                        <div key={sector} className="flex items-center justify-between">
                          <span className="text-gray-300">{sector}</span>
                          <span className="text-blue-400 font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 