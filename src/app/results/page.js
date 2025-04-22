'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Results() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        const assessmentId = searchParams.get('assessmentId');
        if (assessmentId) {
          const token = localStorage.getItem('token');
          if (!token) {
            router.push('/login');
            return;
          }

          const response = await fetch(`http://localhost:5000/api/assessment/${assessmentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch assessment details');
          }

          const data = await response.json();
          console.log('Fetched assessment data:', data); // Debug log
          
          // Ensure recommendations is an array
          const recommendationsArray = Array.isArray(data.recommendations) 
            ? data.recommendations 
            : [data.recommendations];
            
          setRecommendations(recommendationsArray);
        } else {
          // Load recommendations from quiz submission
          const storedRecommendations = localStorage.getItem('recommendations');
          if (!storedRecommendations) {
            router.push('/quiz');
            return;
          }

          const parsedRecommendations = JSON.parse(storedRecommendations);
          console.log('Stored recommendations:', parsedRecommendations); // Debug log
          
          // Ensure recommendations is an array
          const recommendationsArray = Array.isArray(parsedRecommendations) 
            ? parsedRecommendations 
            : [parsedRecommendations];
            
          setRecommendations(recommendationsArray);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [router, searchParams]);

  const getSuitableRecommendations = (recommendations) => {
    if (!Array.isArray(recommendations)) {
      console.error('Recommendations is not an array:', recommendations);
      return [];
    }

    // Filter recommendations with match score above 0.5 (50%)
    const suitableRecommendations = recommendations.filter(rec => {
      if (!rec || typeof rec.match_score !== 'number') {
        console.warn('Invalid recommendation:', rec);
        return false;
      }
      return rec.match_score >= 0.5;
    });
    
    // Sort by match score in descending order
    suitableRecommendations.sort((a, b) => b.match_score - a.match_score);
    
    // Return top 3 recommendations
    return suitableRecommendations.slice(0, 3);
  };

  const renderDetailedAnalysis = (career) => {
    if (!career) {
      console.error('Career data is missing');
      return null;
    }

    console.log('Rendering career:', career); // Debug log

    const analysis = career.detailed_analysis || {};
    const careerGuide = career.career_guide || {};
    const prosAndCons = career.pros_and_cons || {};
    const requirements = career.requirements || {};
    const compensation = career.compensation || {};
    const actionPlan = career.action_plan || {};
    const governmentSpecific = career.government_specific || {};

    return (
      <div className="space-y-6">
        {/* Career Match Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Why This Career Matches You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.personality_match && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Personality Match</div>
                <div className="font-medium text-gray-900">{analysis.personality_match}</div>
              </div>
            )}
            {analysis.interest_alignment && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Interest Alignment</div>
                <div className="font-medium text-gray-900">{analysis.interest_alignment}</div>
              </div>
            )}
            {analysis.skill_compatibility && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Skill Compatibility</div>
                <div className="font-medium text-gray-900">{analysis.skill_compatibility}</div>
              </div>
            )}
            {analysis.growth_potential && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Growth Potential</div>
                <div className="font-medium text-gray-900">{analysis.growth_potential}</div>
              </div>
            )}
          </div>
        </div>

        {/* Career Guide */}
        {careerGuide.overview && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Overview</h4>
                <p className="text-gray-600">{careerGuide.overview}</p>
              </div>
              {careerGuide.day_to_day && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Day-to-Day Responsibilities</h4>
                  <p className="text-gray-600">{careerGuide.day_to_day}</p>
                </div>
              )}
              {careerGuide.career_progression && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Career Progression</h4>
                  <p className="text-gray-600">{careerGuide.career_progression}</p>
                </div>
              )}
              {careerGuide.industry_trends && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Industry Trends</h4>
                  <p className="text-gray-600">{careerGuide.industry_trends}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pros and Cons */}
        {(prosAndCons.advantages?.length > 0 || prosAndCons.disadvantages?.length > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pros and Cons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prosAndCons.advantages?.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Advantages</h4>
                  <ul className="list-disc list-inside text-green-700">
                    {prosAndCons.advantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
              {prosAndCons.disadvantages?.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Disadvantages</h4>
                  <ul className="list-disc list-inside text-red-700">
                    {prosAndCons.disadvantages.map((dis, i) => (
                      <li key={i}>{dis}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requirements */}
        {(requirements.education || requirements.skills || requirements.experience) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requirements.education && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {requirements.education.minimum_qualification && (
                      <li>Minimum: {requirements.education.minimum_qualification}</li>
                    )}
                    {requirements.education.preferred_qualification && (
                      <li>Preferred: {requirements.education.preferred_qualification}</li>
                    )}
                  </ul>
                </div>
              )}
              {requirements.skills && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="space-y-2">
                    {requirements.skills.technical_skills?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500">Technical Skills</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {requirements.skills.technical_skills.map((skill, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {requirements.skills.soft_skills?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500">Soft Skills</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {requirements.skills.soft_skills.map((skill, i) => (
                            <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {requirements.experience && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {requirements.experience.entry_level && (
                      <li>Entry Level: {requirements.experience.entry_level}</li>
                    )}
                    {requirements.experience.mid_level && (
                      <li>Mid Level: {requirements.experience.mid_level}</li>
                    )}
                    {requirements.experience.senior_level && (
                      <li>Senior Level: {requirements.experience.senior_level}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compensation */}
        {(compensation.salary_ranges || compensation.benefits?.length > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compensation.salary_ranges && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Salary Ranges</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {compensation.salary_ranges.entry_level && (
                      <li>Entry Level: {compensation.salary_ranges.entry_level}</li>
                    )}
                    {compensation.salary_ranges.mid_level && (
                      <li>Mid Level: {compensation.salary_ranges.mid_level}</li>
                    )}
                    {compensation.salary_ranges.senior_level && (
                      <li>Senior Level: {compensation.salary_ranges.senior_level}</li>
                    )}
                    {compensation.salary_ranges.top_performers && (
                      <li>Top Performers: {compensation.salary_ranges.top_performers}</li>
                    )}
                  </ul>
                </div>
              )}
              {compensation.benefits?.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {compensation.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Government Job Details */}
        {governmentSpecific.exam_details && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Government Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {governmentSpecific.exam_details && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Exam Details</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {governmentSpecific.exam_details.exam_name && (
                      <li>Exam Name: {governmentSpecific.exam_details.exam_name}</li>
                    )}
                    {governmentSpecific.exam_details.eligibility_criteria && (
                      <li>Eligibility: {governmentSpecific.exam_details.eligibility_criteria}</li>
                    )}
                    {governmentSpecific.exam_details.exam_pattern && (
                      <li>Pattern: {governmentSpecific.exam_details.exam_pattern}</li>
                    )}
                  </ul>
                </div>
              )}
              {governmentSpecific.training && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Training</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {governmentSpecific.training.duration && (
                      <li>Duration: {governmentSpecific.training.duration}</li>
                    )}
                    {governmentSpecific.training.location && (
                      <li>Location: {governmentSpecific.training.location}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {(actionPlan.immediate_steps?.length > 0 || actionPlan.resources) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Action Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionPlan.immediate_steps?.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-500">Immediate Steps</div>
                      <ul className="list-disc list-inside text-gray-600">
                        {actionPlan.immediate_steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    {actionPlan.short_term_goals?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500">Short-term Goals (3-6 months)</div>
                        <ul className="list-disc list-inside text-gray-600">
                          {actionPlan.short_term_goals.map((goal, i) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {actionPlan.resources && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Resources</h4>
                  <div className="space-y-2">
                    {actionPlan.resources.books?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500">Recommended Books</div>
                        <ul className="list-disc list-inside text-gray-600">
                          {actionPlan.resources.books.map((book, i) => (
                            <li key={i}>{book}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {actionPlan.resources.online_courses?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500">Online Courses</div>
                        <ul className="list-disc list-inside text-gray-600">
                          {actionPlan.resources.online_courses.map((course, i) => (
                            <li key={i}>{course}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alternative Career Paths */}
        {career.alternative_paths?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative Career Paths</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {career.alternative_paths.map((alt, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{alt.title}</h4>
                  <p className="text-gray-600 mb-2">{alt.reason}</p>
                  <div className="text-sm text-gray-500">Transition Path:</div>
                  <p className="text-gray-600">{alt.transition_path}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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

  const suitableRecommendations = getSuitableRecommendations(recommendations);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Career Recommendations</h1>
          <p className="text-xl text-gray-600">
            {suitableRecommendations.length > 1 
              ? `Based on your responses, here are your top ${suitableRecommendations.length} career paths`
              : 'Based on your responses, here is your ideal career path'}
          </p>
        </div>

        {suitableRecommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Suitable Recommendations Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any career paths that strongly match your profile. 
              Consider retaking the quiz with different responses or try our text-based recommendations.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/quiz" 
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
              >
                Retake Quiz
              </Link>
              <Link 
                href="/text-recommendations" 
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium"
              >
                Try Text Recommendations
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {suitableRecommendations.map((career, index) => (
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
                        {Math.round(career.match_score * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Match Score</div>
                    </div>
                  </div>

                  {renderDetailedAnalysis(career)}
                </div>
              </div>
            ))}
          </div>
        )}

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