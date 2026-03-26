---
trigger: always_on
---

# Cô Minh Chatbot – Core Development Rules

## 1. Tech Stack

- **Framework**: Next.js 14+ với App Router (`app/` directory).
- **AI**: Vercel AI SDK (`ai` package) + `@ai-sdk/openai`.
- **UI**: Ant Design (`antd`) + `@ant-design/icons`.
- **Language**: TypeScript (strict mode).
- **Styles**: Vanilla CSS trong `app/globals.css` + CSS Modules khi cần. Không dùng Tailwind.

## 2. Project Structure

```
app/
  api/chat/route.ts     ← API streaming endpoint
  layout.tsx            ← Root layout (font, metadata)
  page.tsx              ← Main page
  globals.css           ← Global styles & design tokens
components/
  Sidebar.tsx
  ChatWindow.tsx
  MessageItem.tsx
.agent/
  rules/
  skills/
  workflows/
```

## 3. API Route Rules

- Dùng `streamText` từ `ai` để stream response.
- Model: `openai("gpt-4o-mini")` (default). Có thể override qua env `OPENAI_MODEL`.
- Luôn giữ context window: `messages.slice(-20)` trước khi gửi.
- System prompt PHẢI định nghĩa đầy đủ persona Cô Minh (xem `skills/co-minh-persona/SKILL.md`).
- Không log nội dung tin nhắn của user ra console production.

## 4. Environment Variables

- `OPENAI_API_KEY` — **bắt buộc**.
- `OPENAI_MODEL` — optional, default `gpt-4o-mini`.
- Không commit `.env.local` lên git.
- Cung cấp `.env.local.example` với placeholder values.

## 5. TypeScript & Code Quality

- Không dùng `any`. Dùng proper types từ `ai` và `antd`.
- Component phải có explicit return type.
- Dùng `"use client"` directive cho tất cả components có state/hook.
- Import từ `ai/react` cho `useChat` hook.

## 6. UI/UX Standards

- Design: **Dark premium theme** — deep indigo/charcoal + gradient accents.
- Chat bubbles: User bên phải (accent color), AI bên trái (dark card).
- Auto-scroll xuống tin nhắn mới nhất.
- Hiển thị typing indicator khi AI đang stream.
- Mobile responsive: sidebar collapse trên màn nhỏ.

## 7. Git

- Commit message format: `feat: ...`, `fix: ...`, `style: ...`, `docs: ...`
- Branch: `main` (production), `dev` (development).
- Không commit: `node_modules/`, `.env.local`, `.next/`.
