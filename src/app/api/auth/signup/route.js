import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      console.log('Missing signup fields:', { hasEmail: !!email, hasPassword: !!password });
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('Connecting to database for signup...');
    await connectDB();
    console.log('Connected to database');

    // Check if user already exists
    console.log('Checking if user exists:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create new user
    console.log('Creating new user...');
    const user = new User({ name, email, password });
    await user.save();
    console.log('User created successfully:', user._id.toString());

    return NextResponse.json({
      message: 'Signup successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
} 