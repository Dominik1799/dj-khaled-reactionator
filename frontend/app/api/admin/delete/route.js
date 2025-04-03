import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    // read if from request query params        
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid UUID format' },
        { status: 400 }
      );
    }
    
    const API_URL = process.env.GIF_API_URL;
    const response = await fetch(`${API_URL}/gif/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ message: 'GIF deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting GIF:', error);
    return NextResponse.json(
      { error: 'Failed to delete GIF' },
      { status: 500 }
    );
  }
}