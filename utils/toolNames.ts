/**
 * Map tool function names to user-friendly display names.
 * Add new tools here as needed.
 */
export const TOOL_DISPLAY_NAMES: Record<string, { label: string; icon: string }> = {
  get_fuel_prices:    { label: "Lấy giá xăng dầu",       icon: "⛽" },
  send_discord_report:{ label: "Gửi thông báo đến Discord",     icon: "📨" },
};

export function getToolDisplayName(toolName: string): string {
  return TOOL_DISPLAY_NAMES[toolName]?.label ?? toolName;
}

export function getToolIcon(toolName: string): string {
  return TOOL_DISPLAY_NAMES[toolName]?.icon ?? "⚙️";
}
