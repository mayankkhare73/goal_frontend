import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Career from '@/models/Career';

export async function GET() {
  try {
    await connectDB();
    
    const careers = await Career.find({}, 'title description');
    return NextResponse.json(careers);
  } catch (error) {
    console.error('Error fetching careers:', error);
    return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
  }
} 