import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Petrolimex",
  description: "Trợ lý ảo xăng dầu AI Petrolimex",
};

export default function KieuGiaXangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
