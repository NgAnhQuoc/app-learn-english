import { tool } from "ai";
import { z } from "zod";
import { scrapeFuelPrices } from "@/utils/pvoil";

export const send_discord_report = tool({
  description: `Gửi báo cáo giá xăng dạng embed vào kênh Discord.
⚠️ QUAN TRỌNG: CHỈ GỌI TOOL NÀY 1 LẦN DUY NHẤT trong mỗi lượt trả lời. KHÔNG gọi lại nhiều lần.
- Để gửi đến TẤT CẢ nhóm: truyền target_group="all" → tool tự động gửi đến mọi nhóm, KHÔNG cần gọi lại cho từng nhóm.
- Để gửi đến 1 nhóm cụ thể: truyền đúng tên nhóm vào target_group.`,
  parameters: z.object({
    greeting: z.string().describe("Một câu chào lầy lội ngắn gọn của Cô Kiều để hiển thị trên Discord (VD: 'Chào các em! Giá xăng hôm nay nè 🔥'). Gọi người dùng là 'em', KHÔNG gọi 'mấy đứa'."),
    target_group: z.string().describe("Tên của nhóm Discord cần gửi. Truyền 'all' để gửi TẤT CẢ nhóm trong 1 lần gọi duy nhất."),
    is_comparison: z.boolean().optional().describe("BẮT BUỘC set TRUE nếu người dùng muốn gửi BẢNG SO SÁNH. Mặc định là FALSE."),
    date: z.string().optional().describe("Thời điểm 1 (VD: '08/01/2026'). Nếu chỉ lấy hôm nay thì bỏ trống."),
    compare_date: z.string().optional().describe("Thời điểm 2 để so sánh (VD: '10/01/2026' hoặc 'Hiện tại'). CHỈ điền khi is_comparison=true."),
  }),
  execute: async ({ greeting, target_group, is_comparison, date, compare_date }) => {
    try {
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

      let priceLines = "";
      let embedTitle = "";
      let timeDisplay = "";

      if (is_comparison || compare_date) {
        // --- SO SÁNH ---
        const isCurrent = (val?: string) => !val || val.toLowerCase().includes("hiện tại") || val.toLowerCase().includes("hôm nay");
        const fetchDate1 = isCurrent(date) ? undefined : date;
        const fetchDate2 = isCurrent(compare_date) ? undefined : compare_date;

        const [prices1, prices2] = await Promise.all([
          scrapeFuelPrices(fetchDate1),
          scrapeFuelPrices(fetchDate2)
        ]);

        if (!prices1 || prices1.length === 0) {
          return { success: false, error: "Không lấy được giá xăng từ PVOIL." };
        }

        const getNum = (str: string) => Number(str.replace(/[^\d]/g, "")) || 0;
        const d1Label = date || "Hiện tại";
        const d2Label = compare_date || "Hiện tại";
        
        priceLines = prices1.map(p1 => {
          const p2 = prices2.find(p => p.name === p1.name);
          const val1 = getNum(p1.price);
          const val2 = p2 ? getNum(p2.price) : val1;
          const diff = val1 - val2;
          
          let diffStr = "**Giữ nguyên** 🤔";
          if (diff > 0) diffStr = `**Tăng ${diff.toLocaleString("vi-VN")} đ/lít** 📈`;
          else if (diff < 0) diffStr = `**Giảm ${Math.abs(diff).toLocaleString("vi-VN")} đ/lít** 📉`;

          return `${getEmoji(p1.name)} **${p1.name}**\n├ ${d1Label}: \`${formatPrice(p1.price)} đ\`\n├ ${d2Label}: \`${p2 ? formatPrice(p2.price) : 'N/A'} đ\`\n└ Biến động: ${diffStr}`;
        }).join("\n\n");

        embedTitle = `⚖️ BIẾN ĐỘNG GIÁ XĂNG DẦU`;
        timeDisplay = `📅 So sánh: **${d1Label}** so với **${d2Label}**\n⏰ Gửi lúc: ${vnTime}`;

      } else {
        // --- BÌNH THƯỜNG ---
        const prices = await scrapeFuelPrices(date);
        if (!prices || prices.length === 0) {
          return { success: false, error: "Không lấy được giá xăng từ PVOIL, em thử lại sau nha." };
        }
        
        priceLines = prices.map((p) => 
          `${getEmoji(p.name)}  **${p.name}**  →  \`${formatPrice(p.price)} đ/lít\``
        ).join("\n\n");

        embedTitle = date ? `⛽ BẢNG GIÁ XĂNG DẦU (NGÀY ${date})` : "⛽ BẢNG GIÁ XĂNG DẦU HÔM NAY";
        timeDisplay = date ? `📅 Ngày lấy dữ liệu: **${date}**\n⏰ Gửi lúc: ${vnTime}` : `📅 **${vnTime}**`;
      }

      const embed = {
        title: embedTitle,
        description: `${greeting}\n\n${timeDisplay}\n\n━━━━━━━━━━━━━━━━━━━━\n\n${priceLines}\n\n━━━━━━━━━━━━━━━━━━━━`,
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
});
