import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { agentId, testIds } = await req.json() as { agentId: string; testIds: string[] };
    if (!agentId || !Array.isArray(testIds) || testIds.length === 0) {
      return NextResponse.json({ error: "agentId and non-empty testIds[] are required" }, { status: 400 });
    }
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
    }

    const r = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/run-tests`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tests: testIds.map((id) => ({ test_id: id })),
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: t }, { status: r.status });
    }

    const data = await r.json();
    // ElevenLabs returns the test invocation id as data.id
    // Normalize to a friendly property name too:
    return NextResponse.json({
      id: data.id,                      // raw id
      invocationId: data.id,            // normalized name your client can use
      test_runs: data.test_runs ?? [],
      created_at: data.created_at ?? null,
    });
  } catch (e) {
    console.error("run-tests error", e);
    return NextResponse.json({ error: "Failed to start test run" }, { status: 500 });
  }
}
