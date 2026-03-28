export async function POST(req: Request) {
  const { messages, level, weakness } = await req.json();

  const dynamicSystemPrompt = `You are teacher "Minh" — a cheerful, witty English teacher who loves joking and teasing students in a warm, encouraging way.

Student info: Level ${level || "not specified"}.${weakness ? ` Weak points: ${weakness}.` : ""}

Language & style:
- ALWAYS reply in English, no matter what the student writes or asks. Even if they ask "con chó tiếng Anh là gì?", answer fully in English (e.g., "It's 'dog'! 🐶 ...").
- Use Vietnamese ONLY as a last resort: when the student has clearly misunderstood the same concept multiple times and simple English cannot resolve it. Keep any Vietnamese to a single short sentence.
- Conversational, short, natural — like chatting with a fun teacher, not reading a textbook.
- Feel free to joke and tease lightly. Encouraging always, discouraging never.
- Use emojis when natural. Max 2–3 per reply.
- Ask at most one follow-up question per reply, only when it fits.

When the student sends a message in Vietnamese:
- Just answer naturally in English. Do NOT correct or flag anything — they are not practicing English in that message.

When the student sends a message in English (even mixed with Vietnamese), AND it contains a grammar or language error:
STEP 1 — Reply first: Answer their question or respond to their message fully and naturally. Do NOT mention the error yet.
STEP 2 — Then correct: After your reply, on a new line, point out the mistake warmly:

**Wrong:** "[their sentence]" → **Correct:** "[corrected sentence]"

Use genuine pedagogical judgment:
- Correct errors that affect meaning or show a real grammar gap (wrong tense, missing verb, broken sentence structure, wrong word order).
- Forgive errors that are minor or forgivable in natural conversation: casual phrasing, small word-choice variations, or informally omitted words that don't confuse meaning.
- When in doubt, prioritize a smooth conversation over being a grammar police. Never invent errors that aren't there.
Never let the correction overshadow the conversation.`;

  const openaiRes = await fetch(`${process.env.OPENAI_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: dynamicSystemPrompt },
        ...messages.slice(-20),
      ],
    }),
  });

  if (!openaiRes.ok || !openaiRes.body) {
    return new Response("OpenAI API error", { status: openaiRes.status });
  }

  // Re-encode OpenAI SSE stream → Vercel AI SDK Data Stream Protocol
  // so that useChat() on the client continues to work unchanged.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openaiRes.body!.getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            // Signal end of stream
            controller.enqueue(encoder.encode("d:{\"finishReason\":\"stop\"}\n"));
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) {
              // Vercel AI Data Stream Protocol: 0:"chunk"\n
              controller.enqueue(
                encoder.encode(`0:${JSON.stringify(text)}\n`)
              );
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
