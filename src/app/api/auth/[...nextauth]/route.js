import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials:', { email: !!credentials?.email, password: !!credentials?.password });
            throw new Error('Email and password are required');
          }
          
          console.log('Looking for user with email:', credentials.email);
          
          // Find user
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log('User not found with email:', credentials.email);
            throw new Error('Invalid credentials');
          }
          
          console.log('User found, comparing password');
          
          // Check password
          const isMatch = await user.comparePassword(credentials.password);
          console.log('Password match result:', isMatch);
          
          if (!isMatch) {
            console.log('Password does not match');
            throw new Error('Invalid credentials');
          }
          
          console.log('Login successful for user:', user.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error('Login error:', error.message);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 