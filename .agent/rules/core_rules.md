---
trigger: always_on
---

# Cô Minh Chatbot – Core Development Rules

## 1. Tech Stack

- **Framework**: Next.js 16+ với App Router (`app/` directory).
- **AI**: Vercel AI SDK (`ai` package) + `@ai-sdk/openai` — dùng `streamText` và `generateObject`.
- **UI**: Ant Design (`antd`) + `@ant-design/icons` + `@ant-design/cssinjs`.
- **Language**: TypeScript (strict mode).
- **Styles**: **Tailwind CSS v4** + SCSS (`app/globals.scss`) song song.
  - Tailwind v4 via `@tailwindcss/postcss` (không cần `tailwind.config.js`)
  - **Dùng Tailwind** cho: layout (`flex`, `grid`), spacing (`p-`, `m-`, `gap-`), sizing (`w-`, `h-`), typography utilities.
  - **Dùng SCSS** cho: CSS custom properties (`var(--xxx)`), antd overrides (`.ant-xxx`), animations (`@keyframes`), complex pseudo-selectors.
  - **KHÔNG** dùng `@apply` trong SCSS (tránh conflict).
- **Database**: Supabase (chat history persistence).

## 2. Project Structure

```
app/
  (app)/
    co-minh-english/
      page.tsx            ← Chat page
    co-lanh-vocabulary/
      page.tsx            ← Vocabulary page
      components/
        SearchPanel.tsx
        VocabResultPanel.tsx
    layout.tsx            ← App layout (sidebar + content)
  api/
    chat/route.ts         ← AI streaming endpoint (streamText)
    vocabulary/route.ts   ← Vocabulary lookup (generateObject)
  login/
    page.tsx
    actions.ts            ← Server actions (authenticate, logout)
  globals.scss            ← Design tokens, antd overrides, animations
  layout.tsx              ← Root layout
components/
  AppSidebar.tsx
  ChatWindow.tsx
  MessageItem.tsx
  ChatHistorySidebar.tsx
  SettingsWidget.tsx
  Providers.tsx           ← StyleProvider + AntdRegistry + ConfigProvider + App
utils/
  supabase/
    client.ts
    chat.ts
    vocabulary.ts
.agent/
  rules/
  skills/
  workflows/
postcss.config.mjs        ← Tailwind v4 PostCSS config
```

## 3. API Route Rules

- Dùng `streamText` từ `ai` để stream response.
- Dùng `generateObject` từ `ai` cho structured data (vocabulary lookup).
- Model: `openai("gpt-4o-mini")` (default). Override qua env `OPENAI_MODEL`.
- Luôn giữ context window: `messages.slice(-20)` trước khi gửi.
- System prompt PHẢI định nghĩa đầy đủ persona Cô Minh (xem `skills/co-minh-persona/SKILL.md`).
- Không log nội dung tin nhắn của user ra console production.

## 4. Environment Variables

- `OPENAI_API_KEY` — **bắt buộc**.
- `OPENAI_MODEL` — optional, default `gpt-4o-mini`.
- `OPENAI_API_BASE_URL` — optional, custom OpenAI-compatible endpoint.
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` — cho chat history.
- `ACCOUNT` + `PASSWORD` — simple auth credentials.
- Không commit `.env.local` lên git. Cung cấp `.env.local.example`.

## 5. TypeScript & Code Quality

- Không dùng `any`. Dùng proper types từ `ai` và `antd`.
- Component phải có explicit return type.
- Dùng `"use client"` directive cho tất cả components có state/hook.
- Import từ `ai/react` cho `useChat` hook.
- Dùng `App.useApp()` thay cho `Modal.xxx`, `message.xxx` static (tránh warning theme context).

## 6. Styling Rules — Tailwind + SCSS

### Dùng Tailwind cho

```tsx
<div className="flex items-center gap-3 p-4 rounded-xl">
```

- Layout: `flex`, `grid`, `items-center`, `justify-between`
- Spacing: `p-4`, `px-6`, `gap-2`, `mt-4`, `mb-0`
- Sizing: `w-full`, `max-w-[420px]`, `h-screen`
- Typography utils: `text-sm`, `font-semibold`, `text-center`
- Dùng `!` prefix để override antd khi cần: `!mb-0`, `!w-full`

### Giữ SCSS cho

- CSS variables: `color: var(--accent)`, `border: 1px solid var(--border)`
- Antd overrides: `.ant-menu-item { ... }`, `.ant-card-body { ... }`
- Animations: `@keyframes`, `animation: fadeIn`
- Complex selectors: `&::-webkit-scrollbar`, `&:focus-within`

### Layer order (globals.scss)

```css
@layer theme, base, antd, components, utilities;
```
Tailwind utilities > antd styles > Preflight resets.

## 7. UI/UX Standards

- Design: **Dark premium theme** — deep indigo/charcoal + gold accent (`#facc15`).
- Chat bubbles: User bên phải (gradient accent), AI bên trái (dark card).
- Auto-scroll xuống tin nhắn mới nhất.
- Hiển thị typing indicator khi AI đang stream.
- Mobile responsive: sidebar collapse trên màn nhỏ (≤768px), full-page scroll.

## 8. Git

- Commit message format: `feat: ...`, `fix: ...`, `style: ...`, `docs: ...`
- Branch: `main` (production), `dev` (development).
- Không commit: `node_modules/`, `.env.local`, `.next/`.


