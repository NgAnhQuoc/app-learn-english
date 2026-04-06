import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { YoutubeTranscript } = require("youtube-transcript");

interface RawItem {
  text: string;
  duration: number;
  offset: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const videoId = request.nextUrl.searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  try {
    const raw: RawItem[] = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });

    // Determine if offset is in ms or seconds
    // YouTube transcript API returns ms; some responses return seconds
    const maxOffset = Math.max(...raw.map((r) => r.offset));
    const isMicroseconds = maxOffset > 10000; // >10000 → definitely ms

    const items = raw.map((item) => ({
      text: item.text
        .replace(/\[.*?\]/g, "")
        .replace(/\n/g, " ")
        .trim(),
      offset: isMicroseconds ? item.offset / 1000 : item.offset,
      duration: isMicroseconds ? item.duration / 1000 : item.duration,
    }));

    return NextResponse.json({ items, count: items.length });
  } catch {
    // Try without language filter
    try {
      const raw: RawItem[] = await YoutubeTranscript.fetchTranscript(videoId);
      const maxOffset = Math.max(...raw.map((r) => r.offset));
      const isMicroseconds = maxOffset > 10000;

      const items = raw.map((item) => ({
        text: item.text
          .replace(/\[.*?\]/g, "")
          .replace(/\n/g, " ")
          .trim(),
        offset: isMicroseconds ? item.offset / 1000 : item.offset,
        duration: isMicroseconds ? item.duration / 1000 : item.duration,
      }));

      return NextResponse.json({ items, count: items.length });
    } catch (err2) {
      const message = err2 instanceof Error ? err2.message : "Not available";
      return NextResponse.json(
        { error: `Transcript not available: ${message}`, items: [] },
        { status: 404 }
      );
    }
  }
}
