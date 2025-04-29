import { NextRequest, NextResponse } from 'next/server';

// API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:3000/api';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const emotion_type = searchParams.get('emotion_type');

    if (!emotion_type) {
      return NextResponse.json({ error: 'Emotion type is required' }, { status: 400 });
    }

    // Build the query string
    const queryParams = new URLSearchParams();
    queryParams.append('emotion_type', emotion_type);

    // Forward the request to the API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/emotions/by-type?${queryParams.toString()}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching emotions by type:', error);
    return NextResponse.json({ error: 'Failed to fetch emotions by type' }, { status: 500 });
  }
}
