'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms of service');
      setLoading(false);
      return;
    }

    try {
      // Using the new API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Auto login after successful signup
      const loginResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginResult.error) {
        // If auto-login fails, redirect to login page
        router.push('/login?message=Account created. Please sign in.');
      } else {
        // If auto-login succeeds, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-emerald-500/20">
        <div>
          <h1 className="text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9370db] to-[#00ffff]">Career Quest</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-200">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-700 rounded-lg bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-700 rounded-lg bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-700 rounded-lg bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-700 rounded-lg bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-emerald-500 border-gray-700 rounded focus:ring-emerald-500"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
              I accept the{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 gradient-primary border border-transparent rounded-lg text-white font-medium shadow-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm bg-gray-900/50 text-gray-300 hover:bg-gray-800 transition-all duration-300"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12C6 15.3137 8.68629 18 12 18C14.6124 18 16.8349 16.3304 17.6586 14H12V10H21.8047V14H21.8C20.8734 18.5645 16.8379 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.445 2 18.4831 3.742 20.2815 6.39318L17.0039 8.68815C15.9296 7.06812 14.0895 6 12 6C8.68629 6 6 8.68629 6 12Z" fill="currentColor"/>
              </svg>
              Google
            </button>

            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm bg-gray-900/50 text-gray-300 hover:bg-gray-800 transition-all duration-300"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.489C9.34 21.581 9.523 21.276 9.523 21.012C9.523 20.775 9.513 19.988 9.513 19.151C7 19.696 6.35 18.529 6.15 17.93C6.037 17.634 5.55 16.725 5.125 16.488C4.775 16.3 4.275 15.755 5.115 15.744C5.9 15.732 6.462 16.457 6.65 16.764C7.55 18.27 8.988 17.968 9.56 17.704C9.651 17.032 9.921 16.585 10.225 16.328C7.975 16.07 5.625 15.248 5.625 11.465C5.625 10.391 6.037 9.503 6.675 8.802C6.574 8.55 6.2 7.563 6.775 6.175C6.775 6.175 7.613 5.911 9.524 7.214C10.325 6.996 11.175 6.887 12.025 6.887C12.875 6.887 13.725 6.996 14.526 7.214C16.437 5.9 17.275 6.175 17.275 6.175C17.85 7.563 17.476 8.55 17.375 8.802C18.013 9.503 18.425 10.38 18.425 11.465C18.425 15.26 16.064 16.07 13.814 16.328C14.2 16.65 14.538 17.27 14.538 18.233C14.538 19.61 14.526 20.675 14.526 21.012C14.526 21.276 14.714 21.591 15.214 21.489C19.135 20.165 22 16.417 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 