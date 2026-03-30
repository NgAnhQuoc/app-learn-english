import { NextResponse } from "next/server";
import { scrapeFuelPrices } from "@/utils/pvoil";
import { getActiveWebhooks, getLastFuelPrices, updateLastFuelPrices } from "@/utils/supabase/discord";

export async function GET(req: Request) {
  // Option: Protect this endpoint with a secret, e.g. check Authorization header
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const currentPrices = await scrapeFuelPrices();
    if (!currentPrices || currentPrices.length === 0) {
      return NextResponse.json({ success: false, message: "Không tải được giá xăng" });
    }

    const lastPrices = await getLastFuelPrices();

    // So sánh (đơn giản, chuỗi JSON)
    const isChanged = JSON.stringify(currentPrices) !== JSON.stringify(lastPrices);

    if (isChanged) {
      // Giá thay đổi -> Lưu giá mới
      await updateLastFuelPrices(currentPrices);

      // Lấy danh sách webhooks có auto_notify = true
      const webhooks = await getActiveWebhooks();
      const autoNotifyWebhooks = webhooks.filter((w: any) => w.auto_notify);

      if (autoNotifyWebhooks.length > 0) {
        // Tạo content thông báo
        let content = "🚨 **CỐ BÁO ĐẦU THÁNG LẠI TỚI RỒI! GIÁ XĂNG VỪA BIẾN ĐỘNG NÀY MẤY ĐỨA!** 🚨\n\n";
        currentPrices.forEach(p => {
          content += `- ${p.name}: **${p.price}**\n`;
        });
        content += "\n_Gửi từ Cô Minh quyền lực ngập tràn tình yêu thương_ 👩‍🏫💸";

        // Gửi tới tất cả webhook
        const results = await Promise.all(
          autoNotifyWebhooks.map(async (hook: any) => {
            try {
              const res = await fetch(hook.webhook_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: "Cô Minh Auto Xăng Dầu",
                  content: content,
                }),
              });
              return { name: hook.name, ok: res.ok };
            } catch (e: any) {
              return { name: hook.name, ok: false, error: e.message };
            }
          })
        );
        return NextResponse.json({ success: true, message: "Đã cập nhật và thông báo giá xăng mới", results });
      } else {
        return NextResponse.json({ success: true, message: "Giá thay đổi nhưng không có kênh nào bật thông báo" });
      }
    }

    return NextResponse.json({ success: true, message: "Giá xăng không thay đổi" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
