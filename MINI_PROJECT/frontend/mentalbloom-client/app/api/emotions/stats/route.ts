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
    const days = searchParams.get('days');

    // Build the query string
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days);

    // Forward the request to the API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/emotions/stats?${queryParams.toString()}`, {
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
    console.error('Error fetching emotion stats:', error);
    return NextResponse.json({ error: 'Failed to fetch emotion stats' }, { status: 500 });
  }
}
