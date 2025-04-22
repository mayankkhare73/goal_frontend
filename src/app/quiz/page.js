'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Quiz() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/quiz/questions', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data);
        setAnswers(new Array(data.length).fill([]));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [router]);

  const handleAnswer = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswers = answers[currentQuestionIndex];
    
    if (currentQuestion.allowsMultiple) {
      if (currentAnswers.includes(option.text)) {
        setAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentQuestionIndex] = currentAnswers.filter(a => a !== option.text);
          return newAnswers;
        });
      } else if (currentAnswers.length < currentQuestion.maxSelections) {
        setAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentQuestionIndex] = [...currentAnswers, option.text];
          return newAnswers;
        });
      }
    } else {
      setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex] = [option.text];
        return newAnswers;
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError(null);

      // Format responses for submission
      const formattedResponses = questions.map((question, index) => ({
        question: question.question,
        answer: answers[index] || [],
        category: question.category
      }));

      console.log('Submitting quiz responses:', formattedResponses);

      const response = await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ responses: formattedResponses })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quiz');
      }

      const data = await response.json();
      console.log('Quiz submission successful:', data);
      
      // Store recommendations in localStorage
      localStorage.setItem('recommendations', JSON.stringify(data.recommendations));

      // Format recommendations for saving
      const formattedRecommendations = data.recommendations.map(rec => ({
        ...rec,
        growth_opportunities: Array.isArray(rec.growth_opportunities) 
          ? rec.growth_opportunities 
          : [rec.growth_opportunities],
        potential_challenges: Array.isArray(rec.potential_challenges) 
          ? rec.potential_challenges 
          : [rec.potential_challenges],
        alternative_careers: Array.isArray(rec.alternative_careers) 
          ? rec.alternative_careers 
          : [rec.alternative_careers]
      }));

      // Save assessment history
      const saveResponse = await fetch('http://localhost:5000/api/assessment/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          responses: formattedResponses,
          recommendations: formattedRecommendations
        })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error('Failed to save assessment history:', errorData);
        throw new Error(errorData.error || 'Failed to save assessment history');
      }
      
      // Navigate to results page
      router.push('/results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (submitting) return false;
    if (currentAnswers.length === 0) return false;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.allowsMultiple) {
      return currentAnswers.length <= currentQuestion.maxSelections;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = answers[currentQuestionIndex] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Assessment Quiz</h1>
          <p className="text-gray-600">Answer these questions to discover your ideal career path</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mx-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </div>
          </div>

          {questions.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-2xl font-bold text-gray-400 mr-2 mt-1">
                    {currentQuestionIndex + 1}.
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {questions[currentQuestionIndex].question}
                  </h2>
                </div>
                {questions[currentQuestionIndex].allowsMultiple && (
                  <p className="text-sm text-gray-500 ml-8">
                    Select up to {questions[currentQuestionIndex].maxSelections} options
                  </p>
                )}
              </div>

              <div className="space-y-3 ml-8">
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <div 
                    key={index}
                    className={`
                      p-4 rounded-lg cursor-pointer transition-all duration-200
                      ${currentAnswers.includes(option.text) 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }
                    `}
                    onClick={() => handleAnswer(option)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center mr-3
                        ${currentAnswers.includes(option.text) 
                          ? 'bg-white text-blue-600' 
                          : 'bg-white border-2 border-gray-300'
                        }
                      `}>
                        {currentAnswers.includes(option.text) ? '✓' : ''}
                      </div>
                      <span className="text-left">{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`
                    px-6 py-2 rounded-lg transition-all duration-200
                    ${currentQuestionIndex === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  Previous
                </button>
                <button
                  onClick={currentQuestionIndex === questions.length - 1 ? handleSubmit : handleNext}
                  disabled={!canProceed() || submitting}
                  className={`
                    px-6 py-2 rounded-lg transition-all duration-200
                    ${!canProceed() || submitting
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                    }
                  `}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading questions...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 