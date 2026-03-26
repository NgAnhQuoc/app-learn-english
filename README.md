# Cô Minh Chatbot – AI English Teacher

Chào mừng đến với ứng dụng **Cô Minh Chatbot**! Đây là một ứng dụng học tiếng Anh sử dụng AI với persona "Cô Minh" - một giáo viên hài hước, lầy lội nhưng cực kỳ tâm huyết để giúp học viên sửa lỗi ngữ pháp và luyện phản xạ.

## 🚀 Tính năng chính
- **Chat với AI Persona**: Cô Minh sẽ trò chuyện với bạn bằng tiếng Anh pha lẫn tiếng Việt cực tự nhiên.
- **Sửa lỗi ngữ pháp thông minh**: Cô sẽ ưu tiên phản hồi nội dung trước, sau đó mới chỉ ra lỗi sai và cung cấp câu sửa đúng.
- **Cá nhân hóa trình độ**: Bạn có thể chọn trình độ (A1, A2, B1...) và nhập điểm yếu cần khắc phục ngay trên thanh Sidebar.
- **Giao diện Premium**: Theme tối sang trọng, phản hồi nhanh chóng (streaming) với Vercel AI SDK.

## 🛠️ Stack công nghệ
- **Frontend**: Next.js 14+ (App Router), Ant Design (`antd`).
- **AI Engine**: Vercel AI SDK, OpenAI (GPT-4o-mini).
- **Styling**: Vanilla CSS & CSS Modules.

## 🏗️ Cài đặt & Chạy ứng dụng

### 1. Chuẩn bị Environment Variables
Tạo file `.env.local` ở thư mục gốc và cấu hình các biến sau:
```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
# Nếu sử dụng proxy/base URL khác:
# OPENAI_API_BASE_URL=https://...
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Chạy môi trường Development
Ứng dụng sử dụng `dotenv-cli` để đảm bảo Next.js load đúng file `.env.local`:
```bash
npm run dev
```
Sau đó, mở [http://localhost:3000](http://localhost:3000) (hoặc port được hiển thị trong terminal) để bắt đầu học với Cô Minh! 🎉

## 📝 Scripts
- `npm run dev`: Chạy app ở chế độ development.
- `npm run build`: Build ứng dụng cho môi trường production.
- `npm run start`: Chạy build đã được tối ưu.
- `npm run lint`: Kiểm tra lỗi code.

## ⚠️ Lưu ý cho iCloud Sync
Nếu bạn lưu project trên iCloud Drive, thỉnh thoảng file `package.json` hoặc `.next` có thể bị lỗi đồng bộ. Hãy xóa folder `.next` và chạy lại `npm run dev` để xử lý.

---
Chúc các trò học hành tấn tới cùng Cô Minh! 😏💅
