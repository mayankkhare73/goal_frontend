'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TextRecommendations() {
    const [textInput, setTextInput] = useState('');
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/assessment/text-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ textInput })
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            const data = await response.json();
            if (!data.recommendations || !Array.isArray(data.recommendations)) {
                throw new Error('Invalid response format');
            }
            
            // Store recommendations in localStorage
            localStorage.setItem('recommendations', JSON.stringify(data.recommendations));
            
            // Navigate to results page
            router.push('/results');
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Text-Based Career Recommendations</h1>
                    <p className="text-gray-600">Describe your interests and career aspirations to get personalized recommendations</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="textInput" className="block text-sm font-medium text-gray-700 mb-2">
                                Describe your interests and career aspirations
                            </label>
                            <textarea
                                id="textInput"
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Example: I enjoy working with technology and solving complex problems. I'm interested in roles that involve data analysis and require strong analytical skills..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Generating Recommendations...' : 'Get Recommendations'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
} 