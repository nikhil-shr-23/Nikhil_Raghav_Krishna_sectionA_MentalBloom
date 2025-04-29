import { NextRequest, NextResponse } from 'next/server';

// API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:3000/api';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Forward the request to the API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/emotions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating emotion entry:', error);
    return NextResponse.json({ error: 'Failed to create emotion entry' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const limit = searchParams.get('limit');

    // Build the query string
    const queryParams = new URLSearchParams();
    if (user_id) queryParams.append('user_id', user_id);
    if (limit) queryParams.append('limit', limit);

    // Forward the request to the API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/emotions?${queryParams.toString()}`, {
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
    console.error('Error fetching emotion entries:', error);
    return NextResponse.json({ error: 'Failed to fetch emotion entries' }, { status: 500 });
  }
}
