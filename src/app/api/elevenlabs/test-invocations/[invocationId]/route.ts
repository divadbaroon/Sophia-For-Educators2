import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ invocationId: string }> }; // Next.js 15+

export async function GET(_req: NextRequest, { params }: Params) {
  const { invocationId } = await params;
  if (!invocationId) {
    return NextResponse.json({ error: "invocationId required" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  }

  const r = await fetch(`https://api.elevenlabs.io/v1/convai/test-invocations/${invocationId}`, {
    method: "GET",
    headers: { "xi-api-key": apiKey },
    cache: "no-store",
  });

  if (!r.ok) {
    const t = await r.text();
    return NextResponse.json({ error: t }, { status: r.status });
  }

  const data = await r.json();
  return NextResponse.json(data);
}
