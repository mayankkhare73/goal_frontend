import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import AssessmentHistory from '@/models/AssessmentHistory';
import { generateTextBasedRecommendations } from '@/services/gptService';

// POST /api/assessment 
export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { responses, recommendations } = await request.json();
    
    // Validate responses
    if (!Array.isArray(responses)) {
      return NextResponse.json({ error: 'Responses must be an array' }, { status: 400 });
    }

    // Validate each response has required fields
    for (const response of responses) {
      if (!response.questionId || !Array.isArray(response.answer)) {
        return NextResponse.json({ error: 'Each response must have a questionId and answer array' }, { status: 400 });
      }
    }

    // Validate recommendations
    if (!Array.isArray(recommendations)) {
      return NextResponse.json({ error: 'Recommendations must be an array' }, { status: 400 });
    }

    await connectDB();
    
    const assessment = new AssessmentHistory({
      user: userId,
      responses,
      recommendations,
      type: 'quiz'
    });

    await assessment.save();
    return NextResponse.json({ message: 'Assessment saved successfully', assessmentId: assessment._id }, { status: 201 });
  } catch (error) {
    console.error('Error saving assessment:', error);
    return NextResponse.json({ error: 'Failed to save assessment', details: error.message }, { status: 500 });
  }
} 