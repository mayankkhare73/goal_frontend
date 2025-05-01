'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Quiz() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState([]);
    const [currentAnswers, setCurrentAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Check if user is authenticated
                if (status === 'unauthenticated') {
                    router.push('/login');
                    return;
                }

                if (status === 'loading') {
                    return; // Wait for session to load
                }

                // Use the new API endpoint
                const response = await fetch('/api/quiz/questions');

                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }

                const data = await response.json();
                console.log('API Response:', data);
                // Debug log to see question structure
                if (data && data.length > 0) {
                    console.log('First question structure:', JSON.stringify(data[0], null, 2));
                    console.log('First question options:', JSON.stringify(data[0].options, null, 2));
                }
                setQuestions(data);
            } catch (error) {
                console.error('Error fetching questions:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [router, status]);

    const handleAnswer = (option) => {
        const currentQuestion = questions[currentQuestionIndex];
        const optionValue = typeof option === 'object' ? option._id : option;
        
        if (currentQuestion.allowsMultiple) {
            if (currentAnswers.includes(optionValue)) {
                setCurrentAnswers(currentAnswers.filter(a => a !== optionValue));
            } else if (currentAnswers.length < currentQuestion.maxSelections) {
                setCurrentAnswers([...currentAnswers, optionValue]);
            }
        } else {
            setCurrentAnswers([optionValue]);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setResponses([...responses, { 
                questionId: questions[currentQuestionIndex]._id, 
                answer: currentAnswers 
            }]);
            setCurrentAnswers([]);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setCurrentAnswers(responses[currentQuestionIndex - 1]?.answer || []);
            setResponses(responses.slice(0, -1));
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            // Check if user is authenticated
            if (status === 'unauthenticated') {
                router.push('/login');
                return;
            }

            const finalResponses = [...responses, { 
                questionId: questions[currentQuestionIndex]._id, 
                answer: currentAnswers 
            }];

            console.log('Submitting quiz responses:', finalResponses);

            // Use the API endpoint
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ responses: finalResponses }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit quiz');
            }

            const data = await response.json();
            
            if (!data.recommendations || !Array.isArray(data.recommendations) || data.recommendations.length === 0) {
                console.error('Received invalid recommendations format:', data);
                throw new Error('No valid career recommendations were generated');
            }
            
            console.log(`Received ${data.recommendations.length} recommendations from API`);
            
            // Store recommendations in localStorage
            localStorage.setItem('recommendations', JSON.stringify(data.recommendations));
            
            // Navigate to results page with assessment ID if available
            if (data.assessmentId) {
                router.push(`/results?assessmentId=${data.assessmentId}`);
            } else {
                router.push('/results');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const canProceed = () => {
        if (submitting) return false;
        if (currentAnswers.length === 0) return false;
        
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion?.allowsMultiple) {
            return currentAnswers.length <= currentQuestion.maxSelections;
        }
        return true;
    };

    // Show loading while checking authentication
    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00ffff] mx-auto"></div>
                    <p className="mt-4 text-[#00ffff] text-lg">Loading your career assessment...</p>
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
                <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#9370db]/20 max-w-md mx-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-4">
                        Error Loading Quiz
                    </h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/dashboard"
                            className="gradient-accent text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#00ffff]/20"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Get current question, with safety check
    const currentQuestion = questions[currentQuestionIndex] || {};
    console.log('Current Question:', currentQuestion);
    
    // Parse question text safely
    const questionText = typeof currentQuestion?.text === 'object' 
        ? (currentQuestion?.text?.text || JSON.stringify(currentQuestion?.text))
        : currentQuestion?.text || 'Loading question...';
    
    // Calculate progress
    const progress = ((currentQuestionIndex + 1) / Math.max(questions.length, 1)) * 100;

    return (
        <div className="min-h-screen gradient-hero py-6 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff]">
                            Career Assessment Quiz
                    </h1>
                        <p className="text-gray-300 mt-1">
                            Discover your ideal career path through our interactive quiz
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/results"
                            className="bg-[#3a3a80]/70 backdrop-blur-lg text-gray-300 hover:text-[#00ffff] px-4 py-2 rounded-lg border border-[#9370db]/20 hover:border-[#9370db]/40 transition-all duration-300 text-sm flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                            Assessment History
                        </Link>
                    </div>
                </div>

                <div className="w-full bg-[#3a3a80]/60 rounded-full h-2.5 mb-6">
                    <div 
                        className="bg-gradient-to-r from-[#9370db] to-[#00ffff] h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                                style={{ width: `${progress}%` }}
                    />
                    </div>

                <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#4b0082]/20 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">
                        {currentQuestionIndex + 1}. {questionText}
                    </h2>

                    {currentQuestion?.allowsMultiple && (
                        <p className="mb-4 text-sm text-[#9370db]">
                            Select up to {currentQuestion.maxSelections} options that apply to you
                                    </p>
                                )}

                    <div className="space-y-3 mb-8">
                        {Array.isArray(currentQuestion?.options) && currentQuestion?.options.map((option, index) => {
                            // Skip if option is null or undefined
                            if (option === null || option === undefined) return null;
                            
                            // Make sure option is a string
                            const optionText = typeof option === 'object' ? 
                                (option.text || JSON.stringify(option)) : 
                                String(option);
                            
                            // Get the option's value for comparison
                            const optionValue = typeof option === 'object' ? option._id : option;
                            const isSelected = currentAnswers.includes(optionValue);
                                
                            return (
                                        <button
                                            key={index}
                                    onClick={() => handleAnswer(option)}
                                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 border cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#4b0082]/60 border-[#9370db] text-[#00ffff]'
                                            : 'bg-[#2a2a60]/70 border-[#3a3a80]/60 text-gray-300 hover:bg-[#4b0082]/40 hover:border-[#9370db]/50'
                                    }`}
                                >
                                    {optionText}
                                        </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-between">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                            className={`px-6 py-2 rounded-lg transition-all shadow-lg ${
                                currentQuestionIndex === 0
                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#2a2a60] text-[#00ffff] hover:bg-[#3a3a80] cursor-pointer'
                            }`}
                        >
                            Previous
                        </button>
                        
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className={`gradient-primary px-6 py-2 rounded-lg text-white transition-all shadow-lg ${
                                    !canProceed()
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:opacity-90 cursor-pointer'
                                }`}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !canProceed()}
                                className={`gradient-accent px-6 py-2 rounded-lg text-white transition-all shadow-lg ${
                                    submitting || !canProceed()
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:opacity-90 cursor-pointer'
                                }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-center text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions?.length || 0}
                </div>
            </div>
        </div>
    );
} 