import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import "@/styles/globals.css";

// Admin, Kitchen, and Waiter each manage their own full layout and their own
// utilitarian look — they should NOT get the customer site's Header/Footer,
// and deliberately do NOT get the elegant serif display font either (that's
// a customer-facing brand touch, not a dashboard one).
const STANDALONE_NO_STYLING_PREFIXES = ["/admin", "/kitchen", "/waiter", "/login"];
// QR Table Ordering is customer-facing (same elegant look, same font) but
// still renders its own full-page layout without the site Header/Footer.
const STANDALONE_STYLED_PREFIXES = ["/table"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isBareStandalone = STANDALONE_NO_STYLING_PREFIXES.some((p) => router.pathname.startsWith(p));
  const isStyledStandalone = STANDALONE_STYLED_PREFIXES.some((p) => router.pathname.startsWith(p));

  if (isBareStandalone) {
    return <Component {...pageProps} />;
  }

  if (isStyledStandalone) {
    return (
      <div className="customer-scope">
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <div className="customer-scope flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}
