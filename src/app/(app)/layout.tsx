import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export default function ComposeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="flex h-[calc(100dvh-64px)]">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
