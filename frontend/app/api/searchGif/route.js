import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const API_URL = process.env.GIF_API_URL;

    const response = await fetch(
      `${API_URL}/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from GIPHY API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching GIFs:', error);
    return NextResponse.json(
      { error: 'Failed to search GIFs' },
      { status: 500 }
    );
  }
} 