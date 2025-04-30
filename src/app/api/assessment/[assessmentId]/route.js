import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import AssessmentHistory from '@/models/AssessmentHistory';
import { authOptions } from '../../auth/[...nextauth]/route';

// Route handler for GET /api/assessment/[assessmentId]
export async function GET(request, context) {
  try {
    // Properly await the params object before using it
    const params = await context.params;
    const assessmentId = params.assessmentId;
    
    // Check for history path first
    if (assessmentId === 'history') {
      return NextResponse.json({ message: 'Please use the dedicated history endpoint instead' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    console.log(`Fetching assessment ID: ${assessmentId} for user: ${userId}`);
    
    await connectDB();
    
    try {
      // Use proper error handling for the ObjectId casting
      const assessment = await AssessmentHistory.findOne({
        _id: assessmentId,
        user: userId
      }).select('-__v');

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      return NextResponse.json(assessment);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Invalid assessment ID format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment', details: error.toString() }, { status: 500 });
  }
} 