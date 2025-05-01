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
        
        if (currentQuestion.allowsMultiple) {
            if (currentAnswers.includes(option)) {
                setCurrentAnswers(currentAnswers.filter(a => a !== option));
            } else if (currentAnswers.length < currentQuestion.maxSelections) {
                setCurrentAnswers([...currentAnswers, option]);
            }
        } else {
            setCurrentAnswers([option]);
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
            
            // Navigate to results page
            router.push('/results');
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
        if (currentQuestion.allowsMultiple) {
            return currentAnswers.length <= currentQuestion.maxSelections;
        }
        return true;
    };

    // Show loading while checking authentication
    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-cyan-400 text-lg">Loading your career assessment...</p>
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
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-red-500/20 max-w-md mx-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-4">
                        Error Loading Quiz
                    </h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/dashboard"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    console.log('Current Question:', currentQuestion);
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                        Interactive Career Assessment
                    </h1>
                    <Link
                        href="/dashboard"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-cyan-500/20">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </h2>
                            <span className="text-cyan-400 font-medium">
                                {Math.round(progress)}% Complete
                            </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="mb-8">
                        {currentQuestion && (
                            <>
                                <div className="flex items-start mb-6">
                                    <span className="text-4xl font-bold text-cyan-400 mr-4 mt-1 min-w-[40px] text-center">
                                        {currentQuestionIndex + 1}.
                                    </span>
                                    <h3 className="text-2xl font-semibold text-gray-300 flex-1">
                                        {currentQuestion.question || currentQuestion.text}
                                    </h3>
                                </div>
                                {currentQuestion.allowsMultiple && (
                                    <p className="text-sm text-cyan-400 mb-6 ml-14">
                                        Select up to {currentQuestion.maxSelections} options
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                                    {currentQuestion.options && currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswer(option.text)}
                                            className={`
                                                bg-gray-700/50 hover:bg-gray-700/70 border text-gray-300 px-6 py-4 rounded-lg text-left transition-all duration-300
                                                ${currentAnswers.includes(option.text) 
                                                    ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/10' 
                                                    : 'border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center">
                                                <div className={`
                                                    w-6 h-6 rounded-full flex items-center justify-center mr-3
                                                    ${currentAnswers.includes(option.text) 
                                                        ? 'bg-cyan-500 text-white' 
                                                        : 'bg-gray-600 border border-cyan-500/20'
                                                    }
                                                `}>
                                                    {currentAnswers.includes(option.text) ? '✓' : ''}
                                                </div>
                                                <span className="text-base md:text-lg">{option.text}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                className="bg-gray-700/50 hover:bg-gray-700/70 border border-cyan-500/20 text-gray-300 px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <Link
                                href="/text-recommendations"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20"
                            >
                                Try Text-Based Instead
                            </Link>
                        </div>
                        <button
                            onClick={currentQuestionIndex === questions.length - 1 ? handleSubmit : handleNext}
                            disabled={!canProceed() || submitting}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {currentQuestionIndex === questions.length - 1 ? 'Submitting...' : 'Next'}
                                </div>
                            ) : (
                                currentQuestionIndex === questions.length - 1 ? 'Submit Assessment' : 'Next'
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-cyan-500/20">
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                            About This Assessment
                        </h3>
                        <p className="text-gray-300 mb-4">
                            Our interactive career assessment helps identify your strengths, interests, and preferences to match you with the most suitable career paths.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    ✓
                                </span>
                                <span className="text-gray-300">Takes approximately 5-10 minutes</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    ✓
                                </span>
                                <span className="text-gray-300">Completely free and confidential</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    ✓
                                </span>
                                <span className="text-gray-300">Get instant personalized results</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-500/20">
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                            Tips for Best Results
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    1
                                </span>
                                <span className="text-gray-300">Answer honestly based on your true preferences</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    2
                                </span>
                                <span className="text-gray-300">Don&apos;t overthink - go with your first instinct</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    3
                                </span>
                                <span className="text-gray-300">Consider your long-term career goals</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 