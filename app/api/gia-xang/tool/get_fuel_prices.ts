import { tool } from "ai";
import { z } from "zod";
import { scrapeFuelPrices } from "@/utils/pvoil";

export const get_fuel_prices = tool({
  description: "Lấy thông tin bảng giá xăng dầu mới nhất từ PVOIL.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const prices = await scrapeFuelPrices();
      return { success: true, prices };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "PVOIL mất mạng con ạ, không coi được";
      return { success: false, error: msg };
    }
  },
});
