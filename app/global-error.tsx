"use client";

import "./globals.css";

// Last-resort error page when the root layout itself fails (e.g. the database
// is unreachable). No translations are available here, so it is bilingual.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-faint p-6 text-center">
        <h1 className="text-heading-sm font-semibold">حدث خطأ في الخادم</h1>
        <p className="text-foggy">تعذّر تحميل الصفحة. حاول مرة أخرى بعد قليل.</p>
        <p className="text-foggy" dir="ltr">
          Something went wrong on our side. Please try again in a moment.
        </p>
        <button type="button" onClick={reset} className="h-11 rounded-lg bg-hof px-5 font-medium text-white">
          إعادة المحاولة · Try again
        </button>
      </body>
    </html>
  );
}
