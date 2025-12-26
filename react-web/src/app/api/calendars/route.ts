import { NextResponse } from 'next/server';

/**
 * Handle requests to /api/calendars
 * This endpoint doesn't exist in our backend, so we return a 404
 */
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Endpoint not found',
      message: 'The /calendars endpoint does not exist. Use /events or /tasks endpoints instead.',
      availableEndpoints: [
        '/api/events/user/{userId}',
        '/api/tasks/user/{userId}',
        '/api/contacts/{id}',
        '/api/users/me'
      ]
    },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Endpoint not found' },
    { status: 404 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Endpoint not found' },
    { status: 404 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Endpoint not found' },
    { status: 404 }
  );
}
