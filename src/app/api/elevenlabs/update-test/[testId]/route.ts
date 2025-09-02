import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params; // Await params first
    const {
      testName,
      successCriteria,
      successExamples = [],
      failureExamples = [],
      chatMessages = [],
      dynamicVariables,
      toolCallParameters,
    } = await req.json();

    console.log('🔄 Updating test:', testId);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
    }

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    // Transform data for ElevenLabs API (same format as create)
    const chat_history = (chatMessages as any[]).map((m) => ({
      role: m.type === 'user' ? 'user' : 'agent',
      message: m.text ?? '',
      time_in_call_secs: 1,
    }));

    const success_examples = (successExamples as any[])
      .filter((e) => e?.text?.trim())
      .map((e) => ({ response: e.text, type: 'success' as const }));

    const failure_examples = (failureExamples as any[])
      .filter((e) => e?.text?.trim())
      .map((e) => ({ response: e.text, type: 'failure' as const }));

    const payload = {
      name: testName,
      success_condition: successCriteria,
      chat_history,
      success_examples,
      failure_examples,
      ...(dynamicVariables ? { dynamic_variables: dynamicVariables } : {}),
      ...(toolCallParameters ? { tool_call_parameters: toolCallParameters } : {}),
    };

    console.log('📤 Sending update to ElevenLabs:', {
      testId,
      testName,
      chatHistoryLength: chat_history.length,
      successExamplesCount: success_examples.length,
      failureExamplesCount: failure_examples.length,
    });

    // Try PUT first
    let res = await fetch(`https://api.elevenlabs.io/v1/convai/agent-testing/${testId}`, {
      method: 'PUT',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // If PUT fails with 405, try delete + create approach
    if (!res.ok && res.status === 405) {
      console.log('📄 PUT not supported, trying delete + create approach...');
      
      // Delete the old test
      const deleteRes = await fetch(`https://api.elevenlabs.io/v1/convai/agent-testing/${testId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (deleteRes.ok) {
        // Create a new test with the updated data
        const createRes = await fetch('https://api.elevenlabs.io/v1/convai/agent-testing/create', {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        res = createRes; // Use the create response
        console.log('📄 Used delete + create approach');
      }
    }

    const raw = await res.text();
    console.log(`📥 ElevenLabs API Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      let detail = raw;
      try {
        const parsed = JSON.parse(raw);
        detail = parsed.error || parsed.message || raw;
      } catch {}
      
      console.error(`❌ ElevenLabs API Error: ${res.status} - ${detail}`);
      return NextResponse.json({ error: `Failed to update test: ${detail}` }, { status: res.status });
    }

    const data = raw ? JSON.parse(raw) : {};
    
    console.log('✅ Test updated successfully:', {
      testId: data.id || testId,
      testName: data.name || testName,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error in update test API:', error);
    
    return NextResponse.json(
      { error: 'Failed to update test', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}