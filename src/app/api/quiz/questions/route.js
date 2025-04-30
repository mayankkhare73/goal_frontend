import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Question from '@/models/Question';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log('Fetching questions for user:', userId);
    
    await connectDB();
    
    const questions = await Question.find({}).select('_id question category options allowsMultiple maxSelections');
    console.log('Questions fetched successfully:', questions.length);
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error in quiz/questions route:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch questions',
      details: error.stack
    }, { status: 500 });
  }
} 