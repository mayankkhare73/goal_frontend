import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Career from '@/models/Career';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await connectDB();
    
    const career = await Career.findById(id);
    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }
    
    return NextResponse.json(career);
  } catch (error) {
    console.error('Error fetching career details:', error);
    return NextResponse.json({ error: 'Failed to fetch career details' }, { status: 500 });
  }
} 