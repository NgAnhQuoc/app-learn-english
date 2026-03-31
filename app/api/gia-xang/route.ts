import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { scrapeFuelPrices } from "@/utils/pvoil";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { getActiveWebhooks } = await import("@/utils/supabase/discord");
  const activeWebhooks = await getActiveWebhooks();
  const webhookNames = activeWebhooks.length > 0 ? activeWebhooks.map(w => w.name).join(", ") : "Hệ thống chưa cài đặt nhóm Discord nào";

  const dynamicSystemPrompt = `Bạn là "Cô Kiều" - một người phụ nữ quyền lực, phong cách "hàng thịt", bán luôn cả giá xăng.
- Tính cách của bạn: lầy lội, nhây, hay "cà khịa" nhưng vẫn tử tế.
- CÁCH XƯNG HÔ: Bạn luôn gọi người dùng là "em" hoặc "con", TUYỆT ĐỐI KHÔNG gọi "mấy đứa". Tự xưng là "cô".
- Bạn cập nhật giá xăng rất nhanh và chính xác.
- BẮT BUỘC TRƯỚC TIÊN là gọi công cụ "get_fuel_prices" để LẤY THÔNG TIN GIÁ THỰC TẾ từ hệ thống.
- CÁCH TRÌNH BÀY LÀM THEO ĐÚNG NGỮ CẢNH:
  + TRƯỜNG HỢP 1: Người dùng chỉ đích danh 1 loại xăng/dầu (vd: "E5", "Ron 95", "Diesel") -> BẠN CHỈ trả lời đúng giá loại đó bằng 1 câu văn lầy lội (VD: "Ái chà, nay RON 95 tới xxx đ rồi nhé em, đi ít thôi kẻo sụp ví"), KIÊN QUYẾT KHÔNG đưa bảng, KHÔNG liệt kê loại khác.
  + TRƯỜNG HỢP 2: Người dùng hỏi chung chung (vi dụ: "giá xăng", "giá xăng hiện tại", "bao nhiêu", "đổ xăng", "bảng giá") -> BẮT BUỘC BẠN PHẢI VẼ MỘT BẢNG MARKDOWN (Markdown table) chứa TOÀN BỘ CÁC LOẠI XĂNG DẦU hiện có. Trước khi vẽ bảng PHẢI chêm 1 câu cà khịa, RANDOM 1 trong các mẫu sau (KHÔNG lặp lại câu cũ):
    1. "Hỏi chung chung thế này thì tự nhìn bảng mà dò đi em, cô lười!"
    2. "Ôi em ơi, cô kẻ bảng đẹp như Excel rồi nè, nhìn mà khóc nha 💸"
    3. "Giá hôm nay á? Ngồi vững chưa em, cô show bảng liền cho nè 🎢"
    4. "Em hỏi giá xăng mà cô tưởng em hỏi giá vàng, đắt ngang ngửa rồi đó 😭"
    5. "OK bestie, cô bày ra bảng cho em ngắm nè, đừng có xỉu ngang nha ⛽"
- CHỈ KHI dùng công cụ và có dữ liệu trả về thực, bạn mới được dùng số đó phản hồi người dùng. KHÔNG tự ý bịa số ngẫu nhiên. TUYỆT ĐỐI TUÂN THỦ RULE KẺ BẢNG Ở TRƯỜNG HỢP 2.
- TÀI NGUYÊN WEBHOOK DISCORD ĐANG CÓ (Lưu nội bộ để bạn nhớ): [${webhookNames}]
- QUY TRÌNH HỎI GỬI BÁO CÁO (VUI LÒNG TUÂN THỦ TỪNG BƯỚC):
  + BƯỚC 1: Sau khi trả lời giá xăng xong (dù trả lời 1 loại hay kẻ bảng), CHỈ ĐƯỢC PHÉP mồi thêm 1 câu ngắn gọn hỏi gửi Discord. RANDOM 1 trong các mẫu sau (KHÔNG lặp lại câu cũ):
    1. "Có muốn cô quăng bảng giá lên Discord cho cả nhóm cùng khóc chung không em? 😭📱"
    2. "Muốn cô gửi bảng báo cáo lên Discord cho team cùng ôm ví thở dài hông? 💸"
    3. "Cô ném bảng giá lên Discord cho mấy đứa trong nhóm cùng sốc chung nha em? 🔥"
    4. "Để cô share bảng giá lên Discord cho cả lớp cùng xỉu tập thể hông em? 💀⛽"
    5. "Em muốn cô rải truyền đơn giá xăng lên Discord cho cả nhóm cùng khóc ré không? 😏📢"
    (TUYỆT ĐỐI CHƯA ĐƯỢC đọc tên các kênh ra lúc này).
  + BƯỚC 2: NẾU NGƯỜI DÙNG ĐỒNG Ý GỬI (Ví dụ: "Có", "Gửi đi cô", "ok"):
      * NẾU thấy trong danh sách "Tài nguyên" có nhiều hơn 1 kênh: Bạn hãy liệt kê tên các kênh đó ra và hỏi tiếp: "Cô đang nắm chuôi mấy nhóm này: [${webhookNames}]. Em muốn rải truyền đơn cho TẤT CẢ hay thả bom vô MỘT kênh cụ thể nào thôi?".
      * NẾU người dùng đã khai sẵn mục tiêu từ trước (Ví dụ: "Gửi hết đi", "Ném vô nhóm A giúp con"): Chuyển thẳng tới Bước 3.
  + BƯỚC 3: Khi đã chốt hạ được mục tiêu (all hoặc tên 1 nhóm cụ thể), BẮT BUỘC bạn gọi công cụ "send_discord_report" với khóa \`target_group\` tương ứng. Xong xuôi thì báo "Ting ting 📱 Lên dĩa rồi nha em! Check thông báo ở discord nhé".

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
        description: "Gửi báo cáo giá xăng dạng embed đẹp vào kênh Webhook Discord. Tool sẽ tự động lấy giá xăng mới nhất và format thành embed.",
        parameters: z.object({
          greeting: z.string().describe("Một câu chào lầy lội ngắn gọn của Cô Kiều để hiển thị trên Discord (VD: 'Chào các em! Giá xăng hôm nay nè 🔥'). Gọi người dùng là 'em', KHÔNG gọi 'mấy đứa'."),
          target_group: z.string().describe("Tên của nhóm Discord cần gửi. Truyền chữ 'all' nếu muốn gửi cho tất cả các nhóm."),
        }),
        execute: async ({ greeting, target_group }) => {
          try {
            // 1. Fetch fuel prices
            const prices = await scrapeFuelPrices();
            if (!prices || prices.length === 0) {
              return { success: false, error: "Không lấy được giá xăng từ PVOIL, em thử lại sau nha." };
            }

            // 2. Build embed fields from fuel prices
            const fuelEmoji: Record<string, string> = {
              "xăng": "⛽",
              "dầu": "🛢️",
              "điêzen": "🛢️",
              "diesel": "🛢️",
            };

            const getEmoji = (name: string): string => {
              const lower = name.toLowerCase();
              for (const [key, emoji] of Object.entries(fuelEmoji)) {
                if (lower.includes(key)) return emoji;
              }
              return "📊";
            };

            const formatPrice = (price: string): string => {
              const num = price.replace(/[^\d]/g, "");
              return num ? Number(num).toLocaleString("vi-VN") : price;
            };

            // Build formatted price list for description
            const priceLines = prices.map((p) => 
              `${getEmoji(p.name)}  **${p.name}**  →  \`${formatPrice(p.price)} đ/lít\``
            ).join("\n\n");

            // 3. Build Discord embed
            const now = new Date();
            const vnTime = now.toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const embed = {
              title: "⛽ BẢNG GIÁ XĂNG DẦU HÔM NAY",
              description: `${greeting}\n📅 **${vnTime}**\n\n━━━━━━━━━━━━━━━━━━━━\n\n${priceLines}\n\n━━━━━━━━━━━━━━━━━━━━`,
              color: 0xFACC15, // Gold accent
              footer: {
                text: "Cô Kiều Xăng Dầu • Nguồn: PVOIL",
                icon_url: "https://i.ibb.co/C0W2wF1/cominh.webp",
              },
              timestamp: now.toISOString(),
            };

            // 4. Get webhooks and send
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
                  username: "Cô Kiều Xăng Dầu",
                  avatar_url: "https://i.ibb.co/C0W2wF1/cominh.webp",
                  embeds: [embed],
                }),
              });
              if (!res.ok) {
                const errorBody = await res.text();
                console.error(`Discord webhook error for ${hook.name}:`, res.status, errorBody);
                results.push({ name: hook.name, success: false, error: `HTTP ${res.status}: ${errorBody}` });
              } else {
                results.push({ name: hook.name, success: true });
              }
            }
            
            return {
              success: true,
              message: "Đã gửi thông báo đẹp lung linh!",
              results,
            };
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "Lỗi không xác định";
            return { success: false, error: errorMessage };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
