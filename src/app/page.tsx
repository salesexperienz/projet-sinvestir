import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { CryptoSimulator } from "@/components/CryptoSimulator";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
          <CryptoSimulator />
          <div className="mx-auto max-w-6xl">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
