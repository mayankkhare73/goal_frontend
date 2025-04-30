import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import AssessmentHistory from '@/models/AssessmentHistory';
import { generateTextBasedRecommendations } from '@/services/gptService';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    console.log('User ID from session:', userId);
    
    const { textInput } = await request.json();

    if (!textInput) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    // Generate recommendations using the text-based function
    const recommendations = await generateTextBasedRecommendations(textInput);
    console.log('Text-based recommendations generated');
    
    await connectDB();

    // Save to assessment history
    const assessment = new AssessmentHistory({
      user: userId,
      responses: [], // No quiz responses for text-based input
      recommendations,
      type: 'text-based',
      inputText: textInput
    });

    try {
      await assessment.save();
      console.log('Text-based assessment saved successfully');
    } catch (saveError) {
      console.error('Error saving assessment:', saveError);
      throw new Error(`Failed to save assessment: ${saveError.message}`);
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating text-based recommendations:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate recommendations',
      details: error.toString()
    }, { status: 500 });
  }
} 