import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events/[id]/feedback/[feedbackId] - Get specific feedback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  try {
    const { id: eventId, feedbackId } = await params;

    const feedback = await db.eventFeedback.findFirst({
      where: { id: feedbackId, eventId },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/feedback/[feedbackId] - Delete feedback
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  try {
    const { id: eventId, feedbackId } = await params;

    // Delete responses first
    await db.surveyResponse.deleteMany({
      where: { feedbackId },
    });

    // Delete feedback
    await db.eventFeedback.delete({
      where: { id: feedbackId, eventId },
    });

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
