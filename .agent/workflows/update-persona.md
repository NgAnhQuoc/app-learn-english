---
description: Update Cô Minh's personality or system prompt
---

1. Mở `app/api/chat/route.ts`

2. Tìm constant `systemPrompt` (thường ở đầu file, sau imports)

3. Chỉnh sửa nội dung persona theo yêu cầu.
   Tham khảo: `.agent/skills/co-minh-persona/SKILL.md` để xem toàn bộ system prompt gốc.

4. Lưu file.

// turbo
5. Restart dev server (nếu đang chạy, dừng và start lại):
```bash
npm run dev
```

6. Test lại với 3 scenarios bắt buộc:
   - **Câu sai ngữ pháp**: `I go to school yesterday`
   - **Câu đúng**: `I went to the park last Sunday`
   - **Hỏi từ vựng**: `What does "procrastinate" mean?`

7. Nếu cần lưu version mới của prompt, cập nhật `.agent/skills/co-minh-persona/SKILL.md`.
