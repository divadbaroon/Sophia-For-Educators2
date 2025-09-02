import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      agentId,
      testIds,
      agentConfigOverride
    } = await req.json();

    console.log('🧪 Running tests for agent:', agentId);
    console.log('📋 Test IDs:', testIds);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
    }

    // Transform test IDs to the format expected by ElevenLabs API
    const tests = testIds.map((testId: string) => ({
      test_id: testId  // API expects snake_case, not camelCase
    }));

    // For now, let's run tests without config override to avoid complex field requirements
    // You can add config override later when you have the complete agent structure
    const payload = {
      tests
      // Commenting out agent_config_override until we have complete field mapping
      // ...(agentConfigOverride && { 
      //   agent_config_override: {
      //     ...agentConfigOverride,
      //     conversation_config: {
      //       language: "en",
      //       voice_id: null,
      //       opt_out_sensitive_data_storage: false,
      //       max_conversation_length_seconds: 300
      //     },
      //     platform_settings: {
      //       widget_config: {
      //         layout: "default",
      //         color_scheme: "light"
      //       }
      //     }
      //   }
      // })
    };

    console.log('📤 Sending test run request to ElevenLabs:', {
      agentId,
      testCount: tests.length,
      hasConfigOverride: !!agentConfigOverride
    });

    const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/run-tests`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    console.log('📥 ElevenLabs API Response Status:', res.status);

    if (!res.ok) {
      let detail = raw;
      try {
        const parsed = JSON.parse(raw);
        detail = parsed.error || parsed.message || raw;
      } catch {}
      console.error('❌ ElevenLabs API Error:', detail);
      return NextResponse.json({ error: `Failed to run tests: ${detail}` }, { status: res.status });
    }

    const data = raw ? JSON.parse(raw) : {};
    console.log('✅ Tests started successfully. Run ID:', data.id);
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error running tests:', error);
    return NextResponse.json(
      { error: 'Failed to run tests', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}