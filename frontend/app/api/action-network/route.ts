import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('=== SENDING TO ACTION NETWORK ===');
    console.log(JSON.stringify(body, null, 2));

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

    // if (response.ok) {
    //   return NextResponse.json({ success: true });
    // } else {
    //   return NextResponse.json({ success: false }, { status: response.status });
    // }
    
//   } catch (error) {
//     console.error('Action Network API Error:', error);
//     return NextResponse.json({ success: false }, { status: 500 });
//   }
// }

    const data = await response.text();
    console.log('Form Submission Response:', response.status, data);

    console.log('=== ACTION NETWORK RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response:', data);
    
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