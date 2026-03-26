---
description: Add a new UI component to the chatbot
---

1. Tạo file mới trong `components/[ComponentName].tsx`

2. Thêm `"use client"` ở đầu nếu component dùng state hoặc hooks.

3. Dùng Ant Design components. Import từ `antd` và `@ant-design/icons`.

4. Style bằng CSS Modules (`[ComponentName].module.css`) hoặc `app/globals.css`.
   - Không dùng Tailwind.
   - Màu sắc lấy từ CSS variables đã định nghĩa trong `globals.css` (e.g., `var(--color-bg-card)`).

5. Import và dùng component trong `app/page.tsx` hoặc component cha phù hợp.

6. Test responsive trên mobile (screen width < 768px).
