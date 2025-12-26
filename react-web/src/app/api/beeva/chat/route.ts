export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPSTREAM_URL = 'https://eeva-rag-develop.up.railway.app/v1/beeva/chat';

export async function POST(req: Request) {
  try {
    // Transparent pass-through: forward request body and headers; stream upstream response as-is
    const bodyText = await req.text();

    const upstreamRes = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'content-type': req.headers.get('content-type') ?? 'application/json',
        'accept': req.headers.get('accept') ?? 'application/json',
        ...(req.headers.get('authorization') ? { authorization: req.headers.get('authorization')! } : {}),
      },
      body: bodyText,
    });

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[api/beeva/chat] upstream status', upstreamRes.status);
    }

    // Read as ArrayBuffer to avoid content-encoding mismatches when proxying
    const bodyBuffer = await upstreamRes.arrayBuffer();

    // Copy headers but drop hop-by-hop and encoding/length headers to prevent decoding errors
    const headers = new Headers();
    const blocked = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'keep-alive']);
    upstreamRes.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (blocked.has(k)) return;
      try { headers.set(key, value); } catch {}
    });

    // Ensure we always set a sane Content-Type
    headers.set('Content-Type', upstreamRes.headers.get('content-type') ?? 'application/json');

    return new Response(bodyBuffer, {
      status: upstreamRes.status,
      headers,
    });
  } catch (err) {
    // Only synthesize on unexpected exceptions
    return new Response('Internal Server Error', { status: 500 });
  }
}

