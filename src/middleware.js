import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/', '/api/auth', '/terms', '/privacy', '/home'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  );
  
  // Check if request is for API
  const isApiPath = path.startsWith('/api');
  
  // Get session from cookies
  const sessionCookie = request.cookies.get('next-auth.session-token') || 
                       request.cookies.get('__Secure-next-auth.session-token');
  const isAuthenticated = !!sessionCookie;
  
  // Redirect logic based on authentication status
  if (!isAuthenticated && !isPublicPath && !path.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For API routes, return unauthorized status instead of redirecting
  if (!isAuthenticated && isApiPath && !path.startsWith('/api/auth')) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
  
  // If user is authenticated and trying to access login/signup, redirect to dashboard
  if (isAuthenticated && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Match all paths except for these:
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 