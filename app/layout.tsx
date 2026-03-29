import { Providers } from "../components/Providers";
import "./tailwind-built.css";
import "./globals.scss";



export const metadata = {
  title: "AI English Teacher",
  description: "Luyen tieng Anh cung vien AI hai huoc va hieu qua",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
