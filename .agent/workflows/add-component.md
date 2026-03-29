---
description: Add a new UI component to the chatbot
---

1. Tạo file mới trong `components/[ComponentName].tsx` (hoặc trong feature directory nếu specific).

2. Thêm `"use client"` ở đầu nếu component dùng state hoặc hooks.

3. Dùng Ant Design components. Import từ `antd` và `@ant-design/icons`.
   - Dùng `App.useApp()` cho `modal`, `message`, `notification` (tránh static method warning).

4. Style theo thứ tự ưu tiên:
   - **Tailwind** cho layout, spacing, sizing: `className="flex items-center gap-3 p-4"`
   - **CSS variables inline** nếu cần theme token: `style={{ color: "var(--accent)" }}`
   - **SCSS trong `app/globals.scss`** cho: antd overrides, animations, complex selectors
   - **KHÔNG** dùng `@apply` trong SCSS (tránh xung đột với Tailwind v4)
   - Dùng prefix `!` để override antd khi cần: `className="!mb-0 !w-full"`

5. Import và dùng component trong page hoặc component cha phù hợp.

6. Test responsive trên mobile (≤640px) và tablet (641–1024px).
