import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `https://actionnetwork.org/api/v2/forms/${process.env.ACTION_NETWORK_FORM_ID}/submissions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'OSDI-API-Token': process.env.ACTION_NETWORK_API_KEY!
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.text();
 
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: data || '{}'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}