import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events/[id]/feedback/questions - Get all survey questions for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const questions = await db.surveyQuestion.findMany({
      where: { eventId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching survey questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey questions' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/feedback/questions - Create a survey question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { question, questionType = 'rating', options, isRequired = true } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'question is required' },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get max order
    const maxOrder = await db.surveyQuestion.findFirst({
      where: { eventId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const surveyQuestion = await db.surveyQuestion.create({
      data: {
        eventId,
        question,
        questionType,
        options: options ? JSON.stringify(options) : null,
        isRequired,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    return NextResponse.json({ question: surveyQuestion });
  } catch (error) {
    console.error('Error creating survey question:', error);
    return NextResponse.json(
      { error: 'Failed to create survey question' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/feedback/questions - Update question order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { questions } = body; // Array of { id, order }

    // Update order for each question
    await Promise.all(
      questions.map((q: { id: string; order: number }) =>
        db.surveyQuestion.update({
          where: { id: q.id, eventId },
          data: { order: q.order },
        })
      )
    );

    return NextResponse.json({ message: 'Question order updated' });
  } catch (error) {
    console.error('Error updating question order:', error);
    return NextResponse.json(
      { error: 'Failed to update question order' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/feedback/questions - Delete a survey question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { questionId } = Object.fromEntries(request.nextUrl.searchParams);

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId is required' },
        { status: 400 }
      );
    }

    // Delete responses first
    await db.surveyResponse.deleteMany({
      where: { questionId },
    });

    // Delete question
    await db.surveyQuestion.delete({
      where: { id: questionId, eventId },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey question:', error);
    return NextResponse.json(
      { error: 'Failed to delete survey question' },
      { status: 500 }
    );
  }
}
