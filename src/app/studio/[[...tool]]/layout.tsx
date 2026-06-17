export const metadata = {
  title: "iPhone Store 管理后台",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-[#101112]">
      {children}
    </div>
  );
}
