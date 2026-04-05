import { NextRequest, NextResponse } from "next/server";

// Cache channel IDs per handle (lives for the process lifetime)
const channelIdCache = new Map<string, string>();

/** Strip full URLs like https://youtube.com/@Handle → "Handle" */
function extractHandle(input: string): string {
  const cleaned = input.trim();
  // Match patterns: youtube.com/@X, youtube.com/c/X, youtube.com/channel/X, youtube.com/user/X
  const urlMatch = cleaned.match(
    /youtube\.com\/(?:@|c\/|channel\/|user\/)?([^/?&\s]+)/i
  );
  if (urlMatch) return urlMatch[1].replace(/^@/, "");
  // Plain "@Handle" or "Handle"
  return cleaned.replace(/^@/, "");
}

async function getChannelId(handle: string): Promise<string> {
  if (channelIdCache.has(handle)) return channelIdCache.get(handle)!;

  const res = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`Channel not found: @${handle} (HTTP ${res.status})`);
  const html = await res.text();
  const match = html.match(/feeds\/videos\.xml\?channel_id=([a-zA-Z0-9_-]+)/);
  if (!match) throw new Error(`Could not extract channel ID for @${handle}`);

  channelIdCache.set(handle, match[1]);
  return match[1];
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rawHandle =
    request.nextUrl.searchParams.get("handle") ?? "LearnEnglishWithTVSeries";
  const handle = extractHandle(rawHandle);

  if (!handle) {
    return NextResponse.json(
      { error: "handle is required", videos: [] },
      { status: 400 }
    );
  }

  try {
    const channelId = await getChannelId(handle);
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    const rssRes = await fetch(rssUrl, { next: { revalidate: 1800 } });
    if (!rssRes.ok) throw new Error(`RSS fetch failed: ${rssRes.status}`);

    const xml = await rssRes.text();

    // Extract channel display name from RSS <author><name>
    const channelName = decodeXmlEntities(
      xml.match(/<author>\s*<name>([^<]+)<\/name>/)?.[1] ?? handle
    );

    const entryBlocks = xml.split("<entry>").slice(1);
    const videos = entryBlocks
      .map((block) => {
        const videoId =
          block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
        const title = decodeXmlEntities(
          block.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""
        );
        const published =
          block.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
        const views =
          block.match(/<yt:statistics[^>]*views="([^"]+)"/)?.[1] ?? "0";
        const description = decodeXmlEntities(
          block
            .match(/<media:description>([^<]*)<\/media:description>/)?.[1]
            ?.slice(0, 200) ?? ""
        );

        return {
          id: videoId,
          title,
          published,
          thumbnail: videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : "",
          description,
          views: parseInt(views, 10),
        };
      })
      .filter((v) => v.id && v.title);

    return NextResponse.json({ videos, channelId, handle, channelName });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[YouTube Videos API]", message);
    return NextResponse.json({ error: message, videos: [] }, { status: 500 });
  }
}
