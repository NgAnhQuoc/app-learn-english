import { tool } from "ai";
import { z } from "zod";
import { scrapeFuelPrices } from "@/utils/pvoil";

export const get_fuel_prices = tool({
  description: "Lấy bảng giá xăng dầu từ PVOIL HOẶC SO SÁNH giá giữa 2 thời điểm.",
  parameters: z.object({
    date: z.string().optional().describe("Ngày xem giá xăng, định dạng 'DD/MM/YYYY' (VD: '08/01/2026'). Bỏ trống nếu là hôm nay."),
    compare_date: z.string().optional().describe("Ngày thứ 2 để so sánh (VD: '10/01/2026'). Chú ý: CHỈ điền nếu người dùng có nhu cầu SO SÁNH 2 thời điểm."),
  }),
  execute: async ({ date, compare_date }) => {
    // Normalize: if date is today, pass undefined so PVOIL returns live data (not historical endpoint which lacks today)
    const todayVN = new Date().toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const normalize = (d?: string): string | undefined => {
      if (!d) return undefined;
      const cleaned = d.trim();
      // Match "hôm nay", "today", or today's exact date string
      if (
        cleaned.toLowerCase().includes("hôm nay") ||
        cleaned.toLowerCase().includes("today") ||
        cleaned.toLowerCase().includes("hiện tại") ||
        cleaned === todayVN
      ) {
        return undefined; // Use live endpoint
      }
      return cleaned;
    };

    try {
      if (compare_date) {
        const [prices1, prices2] = await Promise.all([
          scrapeFuelPrices(normalize(date)),
          scrapeFuelPrices(normalize(compare_date))
        ]);
        const getNum = (str: string) => Number(str.replace(/[^\d]/g, "")) || 0;
        
        const comparisons = prices1.map(p1 => {
          const p2 = prices2.find(p => p.name === p1.name);
          const val1 = getNum(p1.price);
          const val2 = p2 ? getNum(p2.price) : val1;
          const diff = val1 - val2;
          let diffStr = "Giữ nguyên";
          if (diff > 0) diffStr = `+${diff.toLocaleString("vi-VN")} đ`;
          else if (diff < 0) diffStr = `${diff.toLocaleString("vi-VN")} đ`;

          return {
            name: p1.name,
            price_date1: p1.price,
            price_date2: p2 ? p2.price : "Không rõ",
            difference: diffStr
          };
        });

        return { 
          success: true, 
          is_comparison: true, 
          date1: date || "Hôm nay", 
          date2: compare_date, 
          data: comparisons 
        };
      }

      const prices = await scrapeFuelPrices(normalize(date));
      return { success: true, is_comparison: false, data: prices };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "PVOIL mất mạng con ạ, không coi được";
      return { success: false, error: msg };
    }
  },
});
