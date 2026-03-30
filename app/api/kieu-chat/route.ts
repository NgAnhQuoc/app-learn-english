import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { scrapeFuelPrices } from "@/utils/pvoil";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { getActiveWebhooks } = await import("@/utils/supabase/discord");
  const activeWebhooks = await getActiveWebhooks();
  const webhookNames = activeWebhooks.length > 0 ? activeWebhooks.map(w => w.name).join(", ") : "Hệ thống chưa cài đặt nhóm Discord nào";

  const dynamicSystemPrompt = `Bạn là "Cô Minh" - một người phụ nữ quyền lực, phong cách "hàng thịt", bán luôn cả giá xăng.
- Tính cách của bạn: lầy lội, nhây, hay "cà khịa" học sinh nhưng vẫn tử tế.
- Bạn cập nhật giá xăng rất nhanh và chính xác.
- BẮT BUỘC TRƯỚC TIÊN là gọi công cụ "get_fuel_prices" để LẤY THÔNG TIN GIÁ THỰC TẾ từ hệ thống.
- TRẢ LỜI ĐÚNG TRỌNG TÂM: Nếu người dùng báo tên 1 loại xăng/dầu cụ thể (vd: "Ron 95", "E5", "Diesel"), BẠN CHỈ ĐƯỢC trả lời DUY NHẤT giá của loại đó, KIÊN QUYẾT KHÔNG liệt kê thêm. Ngược lại, nếu hỏi chung chung (vd: "giá xăng hôm nay", "bảng giá"), BẮT BUỘC bạn phải liệt kê ĐẦY ĐỦ TẤT CẢ các loại xăng dầu cào được từ hệ thống, không được sót loại nào.
- CHỈ KHI dùng công cụ và có dữ liệu trả về thực, bạn mới được dùng số đó phản hồi người dùng. KHÔNG tự ý bịa số ngẫu nhiên hay giá trị ảo [A], [B]. Đọc bảng giá có được từ công cụ và đọc cho học trò nghe bằng giọng thâm thuý, ví dụ: "Ái chà, bữa nay RON 95-III giá báo tới ... rồi nhé con! Đi ít thôi kẻo sụp ví.".
- TÀI NGUYÊN WEBHOOK DISCORD ĐANG CÓ (Lưu nội bộ để bạn nhớ): [${webhookNames}]
- QUY TRÌNH HỎI GỬI BÁO CÁO (VUI LÒNG TUÂN THỦ TỪNG BƯỚC):
  + BƯỚC 1: Sau khi chốt giá xăng xong, CHỈ ĐƯỢC PHÉP mồi thêm 1 câu ngắn gọn: "Có muốn cô gửi thẳng cái bảng báo cáo này lên nhóm Discord để mấy đứa khác cùng khóc chung không con?". (TUYỆT ĐỐI CHƯA ĐƯỢC đọc tên các kênh ra lúc này).
  + BƯỚC 2: NẾU NGƯỜI DÙNG ĐỒNG Ý GỬI (Ví dụ: "Có", "Gửi đi cô"):
      * NẾU thấy trong danh sách "Tài nguyên" có nhiều hơn 1 kênh: Bạn hãy liệt kê tên các kênh đó ra và hỏi tiếp: "Cô đang nắm chuôi mấy nhóm này: [${webhookNames}]. Con muốn rải truyền đơn cho TẤT CẢ hay thả bom vô MỘT kênh cụ thể nào thôi?".
      * NẾU người dùng đã khai sẵn mục tiêu từ trước (Ví dụ: "Gửi hết đi", "Ném vô nhóm A giúp con"): Chuyển thẳng tới Bước 3.
  + BƯỚC 3: Khi đã chốt hạ được mục tiêu (all hoặc tên 1 nhóm cụ thể), BẮT BUỘC bạn gọi công cụ "send_discord_report" với khóa \`target_group\` tương ứng. Xong xuôi thì báo "Ting ting 📱 Lên dĩa rồi nha mấy học trò!".

Nhớ nha, phải hài hước, nửa Việt nửa Anh (ví dụ như "omg", "shocking"...) một cách tự nhiên.`;

  const result = await streamText({
    model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
    system: dynamicSystemPrompt,
    messages: messages.slice(-20),
    maxSteps: 5,
    tools: {
      get_fuel_prices: tool({
        description: "Lấy thông tin bảng giá xăng dầu mới nhất từ PVOIL.",
        parameters: z.object({}),
        execute: async () => {
          try {
            const prices = await scrapeFuelPrices();
            return { success: true, prices };
          } catch (e: any) {
            return { success: false, error: e.message || "PVOIL mất mạng con ạ, không coi được" };
          }
        },
      }),
      send_discord_report: tool({
        description: "Gửi báo cáo giá xăng vào kênh Webhook Discord.",
        parameters: z.object({
          content: z.string().describe("Nội dung tin nhắn giá xăng đã được biên soạn theo giọng điệu lầy lội của Cô Minh"),
          target_group: z.string().describe("Tên của nhóm Discord cần gửi. Truyền chữ 'all' nếu muốn gửi cho tất cả các nhóm."),
        }),
        execute: async ({ content, target_group }) => {
          // Lấy webhook url từ database hoặc env?
          // Vì user nói "có thể add được nhiều webhook discord", nên mình sẽ load danh sách từ database.
          try {
            const { getActiveWebhooks } = await import("@/utils/supabase/discord");
            const webhooks = await getActiveWebhooks();
            
            let targetWebhooks = webhooks;
            if (target_group && target_group.toLowerCase() !== "all") {
                targetWebhooks = webhooks.filter(w => 
                    w.name.toLowerCase().includes(target_group.toLowerCase()) || 
                    target_group.toLowerCase().includes(w.name.toLowerCase())
                );
            }

            if (!targetWebhooks || targetWebhooks.length === 0) {
              return { success: false, error: `Cô kiếm không thấy cái kênh Discord nào tên giống "${target_group}" cả.` };
            }

            const results = [];
            for (const hook of targetWebhooks) {
              const res = await fetch(hook.webhook_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: "Cô Minh Xăng Dầu",
                  avatar_url: "https://i.ibb.co/C0W2wF1/cominh.webp", // Mock avatar
                  content: content,
                }),
              });
              results.push({ name: hook.name, success: res.ok });
            }
            
            return {
              success: true,
              message: "Đã gửi thông báo!",
              results,
            };
          } catch (e: any) {
            return { success: false, error: e.message };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
