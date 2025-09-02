import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const { testId } = params;
    console.log('🔄 Fetching test:', testId);
    
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 400 }
      );
    }

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agent-testing/${testId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📥 ElevenLabs API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ElevenLabs API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch test: ${response.statusText}` },
        { status: response.status }
      );
    }

    const testData = await response.json();

    console.log('✅ Test fetched successfully:', {
      testId: testData.id,
      testName: testData.name,
      chatHistoryLength: testData.chat_history?.length || 0
    });

    return NextResponse.json(testData);
  } catch (error) {
    console.error('❌ Error in get test API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to fetch test', details: errorMessage },
      { status: 500 }
    );
  }
}