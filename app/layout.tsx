// The real root layout (with <html>) lives in app/[locale]/layout.tsx.
// This pass-through exists so app/not-found.tsx can render for non-locale URLs.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
