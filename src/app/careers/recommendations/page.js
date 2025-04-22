'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedRecommendations = localStorage.getItem('careerRecommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
      setLoading(false);
    } else {
      router.push('/quiz');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Career Recommendations</h1>
        
        <div className="space-y-8">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{rec.career_title}</h2>
                  <div className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      Match Score: {(rec.match_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Link 
                  href={`/careers/${rec.career_id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Learn More
                </Link>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Why This Career?</h3>
                <p className="text-gray-600">{rec.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                  <ul className="space-y-2">
                    {rec.required_skills.map((skill, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
                  <ul className="space-y-2">
                    {rec.next_steps.map((step, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/quiz')}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
} 