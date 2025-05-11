import { NextResponse } from 'next/server';


export async function PUT(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Get query parameters
        const name = searchParams.get('name')  || "";
        const description = searchParams.getAll('description');
        const descriptionsParam = description.map(desc => 
            `description=${encodeURIComponent(desc)}`
          ).join('&');
        const id = searchParams.get('id');

        // Validate UUID format (optional but recommended)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'Invalid UUID format' },
                { status: 400 }
            );
        }

        const API_URL = process.env.GIF_API_URL;
        // add name only if its not empty string and not null   
        const nameParameter = name.trim() !== "" ? `&name=${name}` : "";
        const response = await fetch(`${API_URL}/gif/${id}?${nameParameter}&${descriptionsParam}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`While updating gifs, external API responded with status: ${response.status} and error: ${response.statusText}`);
        }



        
        return NextResponse.json(
            { 
                message: 'GIF metadata updated successfully',
                updatedFields: {
                    id,
                    ...(name && { name }),
                    ...(description && { description })
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating GIF metadata:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}