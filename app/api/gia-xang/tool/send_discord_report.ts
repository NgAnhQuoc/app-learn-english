import { tool } from "ai";
import { z } from "zod";
import { scrapeFuelPrices } from "@/utils/pvoil";

export const send_discord_report = tool({
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
});
