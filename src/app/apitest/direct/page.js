"use client";

import { useState } from 'react';

export default function DirectApiTestPage() {
  const [results, setResults] = useState('');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const testDbConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/test');
      const data = await response.json();
      setResults(JSON.stringify(data, null, 2));
    } catch (error) {
      setResults(JSON.stringify({ error: error.message }, null, 2));
    }
    setLoading(false);
  };

  const testSignup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setResults(JSON.stringify(data, null, 2));
    } catch (error) {
      setResults(JSON.stringify({ error: error.message }, null, 2));
    }
    setLoading(false);
  };

  // Direct POST to the NextAuth API endpoint
  const testLoginDirect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signin/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken: await getCsrfToken(),
          email,
          password,
          redirect: false,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(JSON.stringify(data, null, 2));
      } else {
        setResults(JSON.stringify({ 
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: await response.text()
        }, null, 2));
      }
    } catch (error) {
      setResults(JSON.stringify({ error: error.message }, null, 2));
    }
    setLoading(false);
  };

  // Helper function to get CSRF token
  const getCsrfToken = async () => {
    const response = await fetch('/api/auth/csrf');
    const data = await response.json();
    return data.csrfToken;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Direct API Test Page</h1>
      
      <div className="mb-6">
        <label className="block mb-2">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        
        <label className="block mb-2">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={testDbConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test DB Connection
        </button>
        
        <button
          onClick={testSignup}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Signup
        </button>
        
        <button
          onClick={testLoginDirect}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Test Login Direct
        </button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Results:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {loading ? 'Loading...' : results || 'No results yet'}
        </pre>
      </div>
    </div>
  );
} 