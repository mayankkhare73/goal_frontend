'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  
  // Assessment History State
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const dataFetchedRef = useRef(false);
  
  // Track if we're showing specific assessment details or just history
  const [showingAssessmentDetails, setShowingAssessmentDetails] = useState(false);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        // Check if user is authenticated
        if (status === 'unauthenticated') {
          router.push('/login');
          return;
        }

        if (status === 'loading') {
          return; // Wait for session to load
        }

        const assessmentId = searchParams.get('assessmentId');
        if (assessmentId) {
          setShowingAssessmentDetails(true);
          setLoading(true);
          
          // Use the new API endpoint
          const response = await fetch(`/api/assessment/${assessmentId}`);

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
          setLoading(false);
        } else {
          setShowingAssessmentDetails(false);
          // If no assessmentId, just show the history
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setError('Failed to load recommendations');
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [router, searchParams, status]);
  
  // Fetch Assessment History
  const fetchHistory = useCallback(async () => {
    try {
      // Check if user is authenticated
      if (status === 'unauthenticated') {
        return;
      }

      if (status === 'loading') {
        return; // Wait for session to load
      }

      setHistoryLoading(true);
      setHistoryError(null);
      
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
      console.error('History fetch error:', error.message);
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [status]);

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

  const getSuitableRecommendations = (recommendations) => {
    if (!Array.isArray(recommendations)) {
      console.error('Recommendations is not an array:', recommendations);
      return [];
    }

    console.log(`Processing ${recommendations.length} recommendations`);

    // Filter out invalid recommendations
    const validRecommendations = recommendations.filter(rec => {
      if (!rec || typeof rec.match_score !== 'number' || !rec.title) {
        console.warn('Invalid recommendation object:', rec);
        return false;
      }
      return true;
    });
    
    if (validRecommendations.length === 0) {
      console.warn('No valid recommendations found after filtering');
      // If there are no valid recommendations, return an empty array
      return [];
    }

    // Sort all valid recommendations by match score in descending order
    validRecommendations.sort((a, b) => b.match_score - a.match_score);
    
    // Filter recommendations with match score above 0.5 (50%)
    let suitableRecommendations = validRecommendations.filter(rec => rec.match_score >= 0.5);
    
    // If we have suitable recommendations (>=50% match), take 3-5 of them
    if (suitableRecommendations.length > 0) {
      // Take all if we have 5 or fewer suitable recommendations
      if (suitableRecommendations.length <= 5) {
        console.log(`Returning all ${suitableRecommendations.length} suitable recommendations (all have >=50% match)`);
        return suitableRecommendations;
      }
      
      // Otherwise take the top 5
      const result = suitableRecommendations.slice(0, 5);
      console.log(`Returning top 5 of ${suitableRecommendations.length} suitable recommendations`);
      return result;
    }
    
    // If no recommendations meet the 50% threshold, return top 3 of all valid recommendations
    console.log('No recommendations met the 50% threshold, using top 3 of all valid recommendations');
    return validRecommendations.slice(0, 3);
  };

  const renderDetailedAnalysis = (career) => {
    if (!career) return null;

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
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
            Why This Career Matches You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.personality_match && (
              <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                <div className="text-sm text-[#9370db]">Personality Match</div>
                <div className="font-medium text-gray-200">{analysis.personality_match}</div>
              </div>
            )}
            {analysis.interest_alignment && (
              <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                <div className="text-sm text-[#9370db]">Interest Alignment</div>
                <div className="font-medium text-gray-200">{analysis.interest_alignment}</div>
              </div>
            )}
            {analysis.skill_compatibility && (
              <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                <div className="text-sm text-[#00ffff]">Skill Compatibility</div>
                <div className="font-medium text-gray-200">{analysis.skill_compatibility}</div>
              </div>
            )}
            {analysis.growth_potential && (
              <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                <div className="text-sm text-[#00ffff]">Growth Potential</div>
                <div className="font-medium text-gray-200">{analysis.growth_potential}</div>
              </div>
            )}
          </div>
        </div>

        {/* Career Guide */}
        {careerGuide.overview && (
          <div>
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
              Career Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                <h4 className="font-medium text-[#9370db] mb-2">Overview</h4>
                <p className="text-gray-300">{careerGuide.overview}</p>
              </div>
              {careerGuide.day_to_day && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Day-to-Day Responsibilities</h4>
                  <p className="text-gray-300">{careerGuide.day_to_day}</p>
                </div>
              )}
              {careerGuide.career_progression && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                  <h4 className="font-medium text-[#00ffff] mb-2">Career Progression</h4>
                  <p className="text-gray-300">{careerGuide.career_progression}</p>
                </div>
              )}
              {careerGuide.industry_trends && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                  <h4 className="font-medium text-[#00ffff] mb-2">Industry Trends</h4>
                  <p className="text-gray-300">{careerGuide.industry_trends}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pros and Cons */}
        {(prosAndCons.advantages?.length > 0 || prosAndCons.disadvantages?.length > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
              Pros and Cons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prosAndCons.advantages?.length > 0 && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Advantages</h4>
                  <ul className="list-disc list-inside text-gray-300">
                    {prosAndCons.advantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
              {prosAndCons.disadvantages?.length > 0 && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                  <h4 className="font-medium text-[#00ffff] mb-2">Disadvantages</h4>
                  <ul className="list-disc list-inside text-gray-300">
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
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
              Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requirements.education && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Education</h4>
                  <ul className="list-disc list-inside text-gray-300">
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
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Skills</h4>
                  <div className="space-y-2">
                    {requirements.skills.technical_skills?.length > 0 && (
                      <div>
                        <div className="text-sm text-[#9370db]">Technical Skills</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {requirements.skills.technical_skills.map((skill, i) => (
                            <span key={i} className="bg-[#4b0082]/30 text-[#9370db] px-2 py-1 rounded text-sm border border-[#9370db]/20">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {requirements.skills.soft_skills?.length > 0 && (
                      <div>
                        <div className="text-sm text-[#00ffff]">Soft Skills</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {requirements.skills.soft_skills.map((skill, i) => (
                            <span key={i} className="bg-[#00ffff]/20 text-[#00ffff] px-2 py-1 rounded text-sm border border-[#00ffff]/20">
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
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                  <h4 className="font-medium text-[#00ffff] mb-2">Experience</h4>
                  <ul className="list-disc list-inside text-gray-300">
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
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
              Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compensation.salary_ranges && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Salary Ranges</h4>
                  <ul className="list-disc list-inside text-gray-300">
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
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Benefits</h4>
                  <ul className="list-disc list-inside text-gray-300">
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
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
              Government Job Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {governmentSpecific.exam_details && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                  <h4 className="font-medium text-[#00ffff] mb-2">Exam Details</h4>
                  <ul className="list-disc list-inside text-gray-300">
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
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Training</h4>
                  <ul className="list-disc list-inside text-gray-300">
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
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
              Action Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionPlan.immediate_steps?.length > 0 && (
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Goals</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-[#9370db]">Immediate Steps</div>
                      <ul className="list-disc list-inside text-gray-300">
                        {actionPlan.immediate_steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    {actionPlan.short_term_goals?.length > 0 && (
                      <div>
                        <div className="text-sm text-[#9370db]">Short-term Goals (3-6 months)</div>
                        <ul className="list-disc list-inside text-gray-300">
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
                <div className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#9370db]/20">
                  <h4 className="font-medium text-[#9370db] mb-2">Resources</h4>
                  <div className="space-y-2">
                    {actionPlan.resources.books?.length > 0 && (
                      <div>
                        <div className="text-sm text-[#9370db]">Recommended Books</div>
                        <ul className="list-disc list-inside text-gray-300">
                          {actionPlan.resources.books.map((book, i) => (
                            <li key={i}>{book}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {actionPlan.resources.online_courses?.length > 0 && (
                      <div>
                        <div className="text-sm text-[#00ffff]">Online Courses</div>
                        <ul className="list-disc list-inside text-gray-300">
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
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
              Alternative Career Paths
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {career.alternative_paths.map((alt, i) => (
                <div key={i} className="bg-[#3a3a80]/70 p-4 rounded-lg border border-[#00ffff]/20">
                  <h4 className="font-medium text-[#00ffff] mb-2">{alt.title}</h4>
                  <p className="text-gray-300 mb-2">{alt.reason}</p>
                  <div className="text-sm text-[#9370db]">Transition Path:</div>
                  <p className="text-gray-300">{alt.transition_path}</p>
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
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00ffff] mx-auto"></div>
          <p className="mt-4 text-[#00ffff] text-lg">
            Preparing your career intelligence report...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-hero py-8 px-4">
        <div className="max-w-4xl mx-auto bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#9370db]/20">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-6">
            Career Insights Temporarily Unavailable
          </h2>
          <p className="text-gray-300 mb-8">{error}</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.reload()}
              className="gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg"
            >
              Reconnect to Career Database
            </button>
            <Link
              href="/dashboard"
              className="bg-transparent border-2 border-[#9370db]/30 text-white px-6 py-3 rounded-lg hover:bg-[#9370db]/10 transition-all duration-300"
            >
              Return to Command Center
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const suitableRecommendations = showingAssessmentDetails ? getSuitableRecommendations(recommendations) : [];

  return (
    <div className="min-h-screen gradient-hero py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Disclaimer Banner */}
        <div className="bg-gradient-to-r from-[#1a1a40]/80 to-[#3a3a80]/70 backdrop-blur-md border border-[#9370db]/30 rounded-xl shadow-lg p-4 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-400">Career Recommendation Disclaimer</h3>
              <p className="text-xs text-gray-300 mt-1">
                The career recommendations provided are based solely on your assessment inputs and our AI analysis. 
                These suggestions are meant to be informative rather than prescriptive. 
                You are free to choose your own career path based on your personal circumstances, preferences, and opportunities.
                For important career decisions, we recommend consulting with professional career counselors.
              </p>
              <div className="mt-2 text-right">
                <Link href="/disclaimer" className="text-xs text-[#9370db] hover:text-[#00ffff] transition-colors">
                  Read Full Disclaimer
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff]">
            {showingAssessmentDetails ? "Career Recommendations" : "Assessment History"}
          </h1>
          <Link
            href="/dashboard"
            className="bg-[#3a3a80]/70 backdrop-blur-lg text-gray-300 hover:text-[#00ffff] px-4 py-2 rounded-lg border border-[#9370db]/20 hover:border-[#9370db]/40 transition-all duration-300 text-sm flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Show recommendations if viewing specific assessment */}
        {showingAssessmentDetails && (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-lg sm:text-xl text-gray-300">
                {suitableRecommendations.length > 1 
                  ? `Based on your responses, here are your top ${suitableRecommendations.length} career paths`
                  : 'Based on your responses, here is your ideal career path'}
              </p>
            </div>

            {suitableRecommendations.length === 0 ? (
              <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 text-center border border-[#9370db]/20">
                <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3 sm:mb-4">
                  No Suitable Recommendations Found
                </h2>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                  We couldn&apos;t find any career paths that strongly match your profile. 
                  Consider retaking the quiz with different responses or try our text-based recommendations.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link 
                    href="/quiz" 
                    className="gradient-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20 text-sm sm:text-base cursor-pointer"
                  >
                    Retake Quiz
                  </Link>
                  <Link 
                    href="/text-recommendations" 
                    className="gradient-accent text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#00ffff]/20 text-sm sm:text-base cursor-pointer"
                  >
                    Try Text Recommendations
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {suitableRecommendations.map((career, index) => (
                  <div key={index} className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 border border-[#9370db]/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff]">
                          {career.title}
                        </h2>
                        <div className="mt-2">
                          <span className="inline-block bg-[#4b0082]/30 text-[#9370db] px-3 py-1 rounded-full text-xs sm:text-sm">
                            Match Score: {(career.match_score * 100).toFixed(0)}%
                          </span>
                          <span className="inline-block bg-[#00ffff]/20 text-[#00ffff] px-3 py-1 rounded-full text-xs sm:text-sm ml-2">
                            {career.sector} Sector
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCareer(career)}
                        className="gradient-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20 text-sm sm:text-base cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>

                    {selectedCareer === career && (
                      <div className="mt-6 space-y-6">
                        {renderDetailedAnalysis(career)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Back to history button */}
            <div className="mt-8 flex justify-center">
              <Link
                href="/results"
                className="bg-[#3a3a80]/70 backdrop-blur-lg text-gray-300 hover:text-[#00ffff] px-4 py-2 rounded-lg border border-[#9370db]/20 hover:border-[#9370db]/40 transition-all duration-300 text-sm flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Assessment History
              </Link>
            </div>
          </>
        )}
        
        {/* Always show Assessment History Section if not loading */}
        {!showingAssessmentDetails && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff]">
                Your Career Exploration Journey
              </h2>
              <button
                onClick={fetchHistory}
                className="bg-[#3a3a80]/50 backdrop-blur-sm text-gray-300 hover:text-[#00ffff] px-3 py-1.5 rounded-lg border border-[#9370db]/20 hover:border-[#9370db]/40 transition-all duration-300 text-sm flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh Insights
              </button>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ffff]"></div>
              </div>
            ) : historyError ? (
              <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 text-center border border-[#9370db]/20">
                <p className="text-[#9370db] mb-4">Error loading history: {historyError}</p>
                <button
                  onClick={fetchHistory}
                  className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg text-sm cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {paginatedHistory.map((assessment, index) => (
                  <div key={index} className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-5 border border-[#4b0082]/20 hover:border-[#4b0082]/40 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-[#4b0082]/30 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-200">{assessment.type === 'quiz' ? 'Career Quiz' : 'Text Analysis'}</h3>
                            <p className="text-xs text-gray-400">{formatDate(assessment.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          {assessment.recommendations && assessment.recommendations.length > 0 && (
                            <>
                              <p className="text-sm text-gray-300 mb-1">Top Recommendation: <span className="text-[#9370db] font-medium">{assessment.recommendations[0].title}</span></p>
                              <div className="flex items-center">
                                <div className="w-32 bg-[#2a2a60] rounded-full h-2 mr-2">
                                  <div className="bg-gradient-to-r from-[#4b0082] to-[#9370db] h-2 rounded-full" style={{ width: `${assessment.recommendations[0].match_score * 100}%` }}></div>
                                </div>
                                <span className="text-xs text-[#9370db]">{Math.round(assessment.recommendations[0].match_score * 100)}% match</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewDetails(assessment._id)}
                        className="gradient-primary text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-all duration-300 text-sm flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View Career DNA Analysis
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="bg-[#1a1a40]/80 backdrop-blur-lg text-gray-300 px-3 py-1 rounded-lg border border-[#9370db]/20 hover:border-[#9370db]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                            currentPage === index + 1
                              ? 'gradient-primary text-white'
                              : 'bg-[#1a1a40]/80 text-gray-300 border border-[#9370db]/20 hover:border-[#9370db]/40'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-[#1a1a40]/80 backdrop-blur-lg text-gray-300 px-3 py-1 rounded-lg border border-[#9370db]/20 hover:border-[#9370db]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#1a1a40]/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#4b0082]/20 text-center">
                <div className="w-16 h-16 bg-[#4b0082]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No Assessment History</h3>
                <p className="text-sm text-gray-400 mb-4">You haven&apos;t taken any assessments yet. Start a quiz to see your results here.</p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/quiz"
                    className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg cursor-pointer"
                  >
                    Start Quiz
                  </Link>
                  <Link
                    href="/text-recommendations"
                    className="gradient-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg cursor-pointer"
                  >
                    Text Recommendations
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCareer(null)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCareer(null)}></div>
          <div 
            className="bg-[#2a2a60]/90 backdrop-blur-md rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#9370db]/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setSelectedCareer(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-1">
                {selectedCareer.title}
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block bg-[#4b0082]/30 text-[#9370db] px-3 py-1 rounded-full text-xs sm:text-sm">
                  Match Score: {(selectedCareer.match_score * 100).toFixed(0)}%
                </span>
                <span className="inline-block bg-[#00ffff]/20 text-[#00ffff] px-3 py-1 rounded-full text-xs sm:text-sm">
                  {selectedCareer.sector} Sector
                </span>
              </div>
              <p className="text-gray-300 mb-4">{selectedCareer.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedCareer.keywords?.map((keyword, i) => (
                  <span 
                    key={i} 
                    className="inline-block bg-[#4b0082]/30 text-[#9370db] px-3 py-1 rounded-full text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {renderDetailedAnalysis(selectedCareer)}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading fallback for Suspense
function ResultsLoading() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00ffff] mx-auto"></div>
        <p className="mt-4 text-[#00ffff] text-lg">
          Preparing your career intelligence report...
        </p>
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<ResultsLoading />}>
      <ResultsContent />
    </Suspense>
  );
} 