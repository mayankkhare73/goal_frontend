import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    // Count users to test if the User model works
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      userCount
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 