import Link from "next/link";
import "./globals.css";

// Fallback for URLs outside any locale (rare: the proxy adds one to almost everything).
export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-heading-sm font-semibold">الصفحة غير موجودة · Page not found</h1>
        <Link href="/" className="underline underline-offset-4">
          الرئيسية · Home
        </Link>
      </body>
    </html>
  );
}
