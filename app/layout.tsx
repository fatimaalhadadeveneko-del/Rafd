import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rafd-platform.fatimaalhadadeveneko.chatgpt.site"),
  title: "رفد | منصة إنقاذ الفائض الغذائي",
  description: "منصة تتنبأ بفائض الطعام قبل وقوعه وتربط منشآت الضيافة والتجزئة بالجمعيات في نافذة استلام آمنة وموثقة.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "/",
    siteName: "رَفْد",
    title: "رَفْد | أنقذ الفائض قبل أن يصبح هدرًا",
    description: "تنبؤ مبكر، مطابقة ذكية، واستلام موثّق للفائض الغذائي.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "رَفْد — أنقذ الفائض قبل أن يصبح هدرًا" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "رَفْد | أنقذ الفائض قبل أن يصبح هدرًا",
    description: "تنبؤ مبكر، مطابقة ذكية، واستلام موثّق للفائض الغذائي.",
    images: ["/og.png"],
  },
  icons: { icon: "/rafd/logo-mark.png", shortcut: "/rafd/logo-mark.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
