---
name: nextjs-ai-streaming
description: How to implement and maintain AI streaming with Vercel AI SDK in Next.js App Router
---

# Skill: Next.js AI Streaming (Vercel AI SDK)

## Package Versions

```json
{
  "ai": "^3.x or 4.x",
  "@ai-sdk/openai": "^0.x or 1.x"
}
```

> Check latest with: `npm info ai version`

## API Route Pattern

```typescript
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const systemPrompt = `...Cô Minh persona...`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20),
    ],
  });

  return result.toDataStreamResponse();
}
```

## Client Hook Pattern

```tsx
// components/ChatWindow.tsx
"use client";
import { useChat } from "ai/react";

export default function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/chat" });

  return (/* JSX */);
}
```

## Key Types

```typescript
import type { Message } from "ai";
// Message = { id: string; role: "user" | "assistant" | "system"; content: string }
```

## Common Issues

| Issue | Fix |
|-------|-----|
| `useChat` không import được | Dùng `from "ai/react"`, không phải `from "ai"` |
| Streaming không hoạt động | Check `toDataStreamResponse()` trong route |
| CORS error | Đảm bảo route nằm trong `app/api/` |
| API key missing | Check `.env.local` có `OPENAI_API_KEY` |
| **"default export is not a React Component in /layout"** sau nhiều messages | **KHÔNG dùng `await` trước `streamText()`** — `streamText` là synchronous, dùng `await` làm buffer toàn bộ stream → timeout → Turbopack crash với lỗi layout giả |
