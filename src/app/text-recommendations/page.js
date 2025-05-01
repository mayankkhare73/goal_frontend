'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function TextRecommendations() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [textInput, setTextInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [processingStage, setProcessingStage] = useState('');
    const [recommendations, setRecommendations] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setProcessingStage('Starting');

        try {
            // Check if user is authenticated
            if (status === 'unauthenticated') {
                router.push('/login');
                return;
            }

            if (!textInput || textInput.trim().length < 20) {
                throw new Error('Please provide a more detailed description of your interests and career goals');
            }

            setProcessingStage('Sending request to AI for analysis...');
            
            // Use the API endpoint
            const response = await fetch('/api/assessment/text-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ textInput }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.details || 'Failed to generate recommendations');
            }

            setProcessingStage('Processing AI response...');
            const data = await response.json();
            
            if (!data.recommendations || !Array.isArray(data.recommendations) || data.recommendations.length === 0) {
                console.error('Invalid recommendations format:', data);
                throw new Error('No valid recommendations returned from the AI');
            }

            setProcessingStage('Preparing results...');
            console.log('Recommendations received:', data.recommendations.length);
            
            // Set recommendations in state
            setRecommendations(data.recommendations);
            
            // Store recommendations in local storage
            localStorage.setItem('recommendations', JSON.stringify(data.recommendations));
            
            // Navigate to results page with assessment ID if available
            if (data.assessmentId) {
                router.push(`/results?assessmentId=${data.assessmentId}`);
            } else {
                router.push('/results');
            }
        } catch (error) {
            console.error('Error generating text recommendations:', error);
            setError(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
            setProcessingStage('');
        }
    };

    // Redirect if not authenticated
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    // Show loading while checking authentication
    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00ffff] mx-auto"></div>
                    <p className="mt-4 text-[#00ffff] text-lg">
                        {loading && processingStage 
                            ? processingStage 
                            : 'Loading text recommendations...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center">
                <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-[#9370db]/20 max-w-md mx-auto">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-4">
                        Error
                    </h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/dashboard"
                            className="gradient-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#00ffff]/20"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-hero py-6 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff]">
                            Text-Based Career Recommendations
                    </h1>
                        <p className="text-gray-300 mt-1">
                            Tell us about your interests, skills, and career goals for personalized recommendations.
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

                <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#9370db]/20 mb-8">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-4">
                        Tell Us About Your Career Interests
                        </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="userInput"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Describe your interests, skills, education, and career goals
                            </label>
                            <textarea
                                id="userInput"
                                name="userInput"
                                rows={6}
                                className="w-full px-4 py-3 border border-[#4b0082]/50 rounded-lg bg-[#2a2a60]/70 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9370db] focus:border-transparent"
                                placeholder="For example: I enjoy solving problems and working with data. I have a background in mathematics and am interested in technology. I'm looking for a career that combines analytical thinking with creativity."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                required
                            ></textarea>
                            <p className="text-xs text-gray-400 mt-2">
                                Minimum 50 characters. The more details you provide, the better your recommendations will be.
                            </p>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${textInput.length >= 50 ? 'bg-[#00ffff]' : 'bg-gray-500'}`}></div>
                                <span className={`text-xs ${textInput.length >= 50 ? 'text-[#00ffff]' : 'text-gray-400'}`}>
                                    {textInput.length} / 50 characters minimum
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || textInput.length < 50}
                                className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing...
                                    </div>
                                ) : (
                                    'Get Recommendations'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {recommendations.length > 0 && (
                    <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#9370db]/20">
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-6">
                            Your Career Recommendations
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {recommendations.map((recommendation, index) => (
                                <div
                                    key={index}
                                    className="bg-[#2a2a60]/70 rounded-lg p-5 border border-[#9370db]/20 hover:border-[#9370db]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#9370db]/5"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-200">{recommendation.title}</h3>
                                            <div className="flex items-center mt-1">
                                                <div className="w-24 bg-[#1a1a40]/70 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-gradient-to-r from-[#4b0082] to-[#9370db] h-2 rounded-full"
                                                        style={{ width: `${recommendation.match_score * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-[#00ffff]">
                                                    {Math.round(recommendation.match_score * 100)}% match
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => router.push('/results')}
                                            className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg text-sm cursor-pointer"
                                        >
                                            View Results
                                        </button>
                                    </div>
                                    
                                    <p className="text-sm text-gray-300 mb-3">
                                        {recommendation.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <div className="text-xs py-1 px-2 bg-[#4b0082]/30 text-[#9370db] rounded-full">
                                            {recommendation.sector}
                                        </div>
                                        {recommendation.keywords && recommendation.keywords.map((keyword, i) => (
                                            <div
                                                key={i}
                                                className="text-xs py-1 px-2 bg-[#00ffff]/20 text-[#00ffff] rounded-full"
                                            >
                                                {keyword}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && recommendations.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#9370db]/20">
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff] mb-3">
                                Example Input
                            </h3>
                            <p className="text-sm text-gray-300 mb-4">
                                &quot;I have a degree in computer science and enjoy solving complex problems. I&apos;m detail-oriented and prefer working independently rather than in large teams. I&apos;m interested in artificial intelligence and machine learning, but also enjoy designing user interfaces and making technology accessible to everyone. I&apos;d like a career that allows for continuous learning and creativity.&quot;
                            </p>
                            <button
                                onClick={() => setTextInput("I have a degree in computer science and enjoy solving complex problems. I'm detail-oriented and prefer working independently rather than in large teams. I'm interested in artificial intelligence and machine learning, but also enjoy designing user interfaces and making technology accessible to everyone. I'd like a career that allows for continuous learning and creativity.")}
                                className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-[#9370db]/20 text-sm cursor-pointer"
                            >
                                Use This Example
                            </button>
                        </div>

                        <div className="bg-[#3a3a80]/70 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-[#00ffff]/20">
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#9370db] mb-3">
                                Tips for Better Results
                        </h3>
                            <ul className="space-y-2">
                            <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#00ffff]/20 text-[#00ffff] rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-1">
                                        ✓
                                </span>
                                    <span className="text-gray-300 text-sm">Mention specific skills and knowledge areas you enjoy</span>
                            </li>
                            <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#00ffff]/20 text-[#00ffff] rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-1">
                                        ✓
                                </span>
                                    <span className="text-gray-300 text-sm">Include your education background and experience level</span>
                            </li>
                            <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#00ffff]/20 text-[#00ffff] rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-1">
                                    ✓
                                </span>
                                    <span className="text-gray-300 text-sm">Describe work environments you thrive in</span>
                            </li>
                            <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#00ffff]/20 text-[#00ffff] rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-1">
                                    ✓
                                </span>
                                    <span className="text-gray-300 text-sm">Mention your personal values and career aspirations</span>
                            </li>
                            <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#00ffff]/20 text-[#00ffff] rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-1">
                                    ✓
                                </span>
                                    <span className="text-gray-300 text-sm">Be honest about your strengths and areas of interest</span>
                            </li>
                        </ul>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
} 