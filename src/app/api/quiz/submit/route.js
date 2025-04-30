import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import AssessmentHistory from '@/models/AssessmentHistory';
import { generateCareerRecommendations } from '@/services/gptService';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Convert user ID to string explicitly to ensure it matches the expected format
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    console.log('User ID from session:', userId);
    
    const { responses } = await request.json();

    // Validate responses
    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Invalid responses format' }, { status: 400 });
    }

    await connectDB();

    // Format responses with questionId
    const formattedResponses = await Promise.all(responses.map(async (response) => {
      if (!response.questionId) {
        throw new Error('Question ID is required for each response');
      }

      // Verify the question exists
      const question = await Question.findById(response.questionId);
      if (!question) {
        throw new Error(`Question not found with ID: ${response.questionId}`);
      }

      return {
        questionId: response.questionId,
        answer: response.answer,
        timestamp: new Date()
      };
    }));

    // Generate recommendations
    const recommendations = await generateCareerRecommendations(responses);
    console.log('Recommendations generated successfully');

    // Save to assessment history
    const assessment = new AssessmentHistory({
      user: userId,
      responses: formattedResponses,
      recommendations: recommendations.recommendations,
      type: 'quiz'
    });

    try {
      await assessment.save();
      console.log('Assessment history saved successfully');
    } catch (saveError) {
      console.error('Error saving assessment:', saveError);
      throw new Error(`Failed to save assessment: ${saveError.message}`);
    }

    // Return the recommendations in the exact same format as the original backend
    return NextResponse.json({
      recommendations: recommendations.recommendations
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to submit quiz',
      details: error.toString()
    }, { status: 500 });
  }
} 