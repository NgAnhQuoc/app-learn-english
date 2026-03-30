import { createClient } from "@supabase/supabase-js";

// Sử dụng service role key cho các cron job hoặc API nội bộ
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function getActiveWebhooks() {
  const { data, error } = await supabaseAdmin
    .from("discord_settings")
    .select("id, name, webhook_url, is_active, auto_notify")
    .eq("is_active", true);

  if (error) {
    console.error("Lỗi lấy danh sách webhooks:", error);
    return [];
  }
  return data;
}

export async function getLastFuelPrices() {
  const { data, error } = await supabaseAdmin
    .from("fuel_prices_cache")
    .select("prices_json")
    .eq("id", 1)
    .single();

  if (error && error.code !== "PGRST116") { // Ignore if row doesn't exist
    console.error("Lỗi lấy giá xăng cũ:", error);
    return null;
  }
  return data?.prices_json;
}

export async function updateLastFuelPrices(prices: any) {
  const { error } = await supabaseAdmin
    .from("fuel_prices_cache")
    .upsert({ id: 1, prices_json: prices });

  if (error) {
    console.error("Lỗi cập nhật giá xăng cũ:", error);
  }
}
