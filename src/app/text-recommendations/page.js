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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check if user is authenticated
            if (status === 'unauthenticated') {
                router.push('/login');
                return;
            }

            // Use the new API endpoint
            const response = await fetch('/api/assessment/text-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ textInput }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate recommendations');
            }

            const data = await response.json();
            localStorage.setItem('recommendations', JSON.stringify(data.recommendations));
            router.push('/results');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Redirect if not authenticated
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    // Show loading while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-cyan-400 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                        AI-Powered Career Path Finder
                    </h1>
                    <Link
                        href="/dashboard"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20 text-sm sm:text-base"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 border border-cyan-500/20">
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-3 sm:mb-4">
                            Discover Your Perfect Career Match
                        </h2>
                        <p className="text-sm sm:text-base text-gray-300">
                            Share your skills, interests, and career aspirations. Our AI will analyze your input and provide personalized career recommendations.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label htmlFor="textInput" className="block text-sm font-medium text-gray-300 mb-2">
                                Your Career Description
                            </label>
                            <textarea
                                id="textInput"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                className="w-full h-48 sm:h-64 bg-gray-700/50 border border-cyan-500/20 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-sm sm:text-base"
                                placeholder="Example: I have a background in computer science and enjoy problem-solving. I'm interested in working with data and creating innovative solutions. I prefer roles that allow for creativity and continuous learning..."
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm sm:text-base">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-4">
                            <Link
                                href="/quiz"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20 text-sm sm:text-base text-center"
                            >
                                Take Quiz Instead
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating Recommendations...
                                    </div>
                                ) : (
                                    'Generate Recommendations'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 border border-cyan-500/20">
                        <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                            How It Works
                        </h3>
                        <ul className="space-y-3 sm:space-y-4">
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    1
                                </span>
                                <span className="text-sm sm:text-base text-gray-300">Describe your skills, interests, and career goals</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    2
                                </span>
                                <span className="text-sm sm:text-base text-gray-300">Our AI analyzes your input using advanced algorithms</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    3
                                </span>
                                <span className="text-sm sm:text-base text-gray-300">Receive personalized career recommendations</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 border border-blue-500/20">
                        <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                            Tips for Best Results
                        </h3>
                        <ul className="space-y-3 sm:space-y-4">
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    ✓
                                </span>
                                <span className="text-sm sm:text-base text-gray-300">Be specific about your skills and experience</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    ✓
                                </span>
                                <span className="text-sm sm:text-base text-gray-300">Mention your preferred work environment</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                    ✓
                                </span>
                                <span className="text-sm sm:text-base text-gray-300">Include your long-term career goals</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 