
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      testName,
      successCriteria,
      successExamples = [],
      failureExamples = [],
      chatMessages = [],
      dynamicVariables,
      toolCallParameters,
    } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
    }

    const chat_history = (chatMessages as any[]).map((m) => ({
      role: m.type === 'user' ? 'user' : 'assistant',
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

    const res = await fetch('https://api.elevenlabs.io/v1/convai/agent-testing/create', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();

    if (!res.ok) {
      let detail = raw;
      try {
        const parsed = JSON.parse(raw);
        detail = parsed.error || parsed.message || raw;
      } catch {
      }
      return NextResponse.json({ error: `Failed to create test: ${detail}` }, { status: res.status });
    }

    const data = raw ? JSON.parse(raw) : {};
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create test', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
