'use client';

// Force dynamic rendering to prevent Vercel build issues
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // Only redirect to dashboard if authenticated
    // Otherwise always go to home page, even during loading
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else {
      router.push('/home');
    }
  }, [router, status]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a40]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-emerald-400 text-lg">Loading...</p>
      </div>
    </div>
  );
}
