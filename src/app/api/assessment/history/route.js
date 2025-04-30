import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import AssessmentHistory from '@/models/AssessmentHistory';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log('Fetching history for user ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    await connectDB();
    
    try {
      const history = await AssessmentHistory.find({ user: userId })
        .sort({ date: -1 })
        .select('-__v');
      
      console.log(`Found ${history.length} assessment records for user`);
      
      return NextResponse.json({ history });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment history', details: error.toString() }, { status: 500 });
  }
} 