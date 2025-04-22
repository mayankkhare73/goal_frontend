'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Results() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we're viewing a specific assessment from the dashboard
    const selectedAssessment = localStorage.getItem('selectedAssessment');
    if (selectedAssessment) {
      try {
        const assessment = JSON.parse(selectedAssessment);
        setRecommendations(assessment.recommendations);
        // Clear the selected assessment from localStorage
        localStorage.removeItem('selectedAssessment');
      } catch (error) {
        setError('Failed to load assessment details');
        console.error('Error parsing assessment:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Load recommendations from quiz submission
      const storedRecommendations = localStorage.getItem('recommendations');
      if (!storedRecommendations) {
        router.push('/quiz');
        return;
      }

      try {
        const parsedRecommendations = JSON.parse(storedRecommendations);
        setRecommendations(parsedRecommendations);
      } catch (error) {
        setError('Failed to load recommendations');
        console.error('Error parsing recommendations:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Analyzing your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl mb-6 shadow-lg">
            {error}
          </div>
          <Link 
            href="/quiz" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
          >
            Retake Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Career Recommendations</h1>
          <p className="text-xl text-gray-600">Based on your responses, here are your ideal career paths</p>
        </div>

        <div className="space-y-8">
          {recommendations.map((career, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{career.title}</h2>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                      career.sector === 'Government' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {career.sector} Sector
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600">
                      {career.match_score}%
                    </div>
                    <div className="text-sm text-gray-500">Match Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {career.required_skills.map((skill, i) => (
                          <span key={i} className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(career.required_qualifications) 
                          ? career.required_qualifications.map((qual, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm">
                                {qual}
                              </span>
                            ))
                          : <p className="text-gray-600">{career.required_qualifications}</p>
                        }
                      </div>
                    </div>

                    {career.sector === 'Government' && career.exam_requirements && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Exam Requirements</h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(career.exam_requirements)
                            ? career.exam_requirements.map((exam, i) => (
                                <span key={i} className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm">
                                  {exam}
                                </span>
                              ))
                            : <p className="text-gray-600">{career.exam_requirements}</p>
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Salary Range</div>
                          <div className="font-medium text-gray-900">{career.salary_range}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Job Security</div>
                          <div className="font-medium text-gray-900">{career.job_security}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Work-Life Balance</div>
                          <div className="font-medium text-gray-900">{career.work_life_balance}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Location Flexibility</div>
                          <div className="font-medium text-gray-900">{career.location_flexibility}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Growth Opportunities</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(career.growth_opportunities)
                          ? career.growth_opportunities.map((opp, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm">
                                {opp}
                              </span>
                            ))
                          : <p className="text-gray-600">{career.growth_opportunities}</p>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
                    <p className="text-gray-600">{career.next_steps}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Potential Challenges</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(career.potential_challenges)
                        ? career.potential_challenges.map((challenge, i) => (
                            <span key={i} className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm">
                              {challenge}
                            </span>
                          ))
                        : <p className="text-gray-600">{career.potential_challenges}</p>
                      }
                    </div>
                  </div>

                  {career.alternative_careers && career.alternative_careers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative Career Paths</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(career.alternative_careers)
                          ? career.alternative_careers.map((alt, i) => (
                              <span key={i} className="bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full text-sm">
                                {alt}
                              </span>
                            ))
                          : <p className="text-gray-600">{career.alternative_careers}</p>
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center space-x-6">
          <Link 
            href="/quiz" 
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Retake Quiz
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 