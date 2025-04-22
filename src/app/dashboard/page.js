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

  const handleViewDetails = (assessment) => {
    // Store the selected assessment in localStorage
    localStorage.setItem('selectedAssessment', JSON.stringify(assessment));
    // Navigate to the results page
    router.push('/results');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Assessment History</h1>
          <button
            onClick={() => router.push('/quiz')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Take New Assessment
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No assessment history found.</p>
            <button
              onClick={() => router.push('/quiz')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Take Your First Assessment
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((assessment, index) => (
              <div key={assessment._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Assessment #{history.length - index}
                    </h2>
                    <p className="text-gray-500">
                      {formatDate(assessment.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(assessment)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Top Recommendations</h3>
                    <ul className="space-y-2">
                      {assessment.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-2">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{rec.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sector Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        assessment.recommendations.reduce((acc, rec) => {
                          const sector = rec.sector || 'Other';
                          acc[sector] = (acc[sector] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([sector, count]) => (
                        <div key={sector} className="flex items-center justify-between">
                          <span className="text-gray-600">{sector}</span>
                          <span className="text-gray-800 font-medium">{count}</span>
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