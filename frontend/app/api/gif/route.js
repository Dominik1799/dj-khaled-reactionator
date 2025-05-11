import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get URL and search params
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    // onlyNullDescription is a boolean with default value false
    const onlyNullDescription = searchParams.get('onlyNullDescription') === 'true' || false;
    const page = parseInt(searchParams.get('page')) || 0;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;

    const API_URL = process.env.GIF_API_URL;
    // Make request to your external API
    const response = await fetch(`${API_URL}/gif?onlyNullDescription=${onlyNullDescription}&page=${page}&pageSize=${pageSize}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        }
    );
    
    if (!response.ok) {
      throw new Error(`While retrieving gifs, external API responded with status: ${response.status} and error: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure the response matches the expected GifResponseEntity format
    const formattedResponse = {
      gifs: data.gifs.map(gif => ({
        id: gif.id,
        created: gif.created,
        updated: gif.updated,
        name: gif.name,
        descriptions: gif.descriptions,
        mediaDirectoryFileName: gif.mediaDirectoryFileName
      })),
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Error fetching GIFs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GIFs' },
      { status: 500 }
    );
  }
}
