import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Get the user's question from the frontend's request
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required.' },
        { status: 400 }
      );
    }

    // 2. Forward the question to your Python (Vanna) server
    const vannaResponse = await fetch(`${process.env.VANNA_API_BASE_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: question }),
    });

    if (!vannaResponse.ok) {
      const errorData = await vannaResponse.json();
      console.error('Vanna API Error:', errorData);
      return NextResponse.json(
        { error: 'Error from Vanna service.', details: errorData },
        { status: vannaResponse.status }
      );
    }

    // 3. Send the Vanna's response (SQL, results, chart) back to the frontend
    const data = await vannaResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}