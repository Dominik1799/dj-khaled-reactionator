import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the id from the URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }    
    
    const API_URL = process.env.GIF_API_URL;

    // Make request to the backend API
    const response = await fetch(`${API_URL}/gif/media/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'image/gif',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch GIF' },
        { status: response.status }
      );
    }

    // Get the GIF data as a blob
    const gifBlob = await response.blob();

    // Return the GIF with appropriate headers
    return new NextResponse(gifBlob, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error fetching GIF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
