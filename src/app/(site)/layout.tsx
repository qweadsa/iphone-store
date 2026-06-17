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
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </UserProvider>
    </I18nProvider>
  );
}
