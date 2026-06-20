import { CartProvider } from "@/lib/cart-context";
import { UserProvider } from "@/lib/user-context";
import { I18nProvider } from "@/lib/i18n-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <I18nProvider>
      <UserProvider>
        <CartProvider>
          <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
            <Header />
            <main className="min-w-0 flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </UserProvider>
    </I18nProvider>
  );
}
