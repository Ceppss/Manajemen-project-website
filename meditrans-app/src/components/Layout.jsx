import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { loadAll } from "../auth/store";

export default function Layout() {
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAll()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F4F5F9]">
        <div className="text-center">
          <img src="/logo.png" alt="Meditrans" className="mx-auto h-14 w-14 rounded-full object-cover" />
          <p className="mt-4 text-sm font-semibold text-navy">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F4F5F9]">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-6 text-center">
          <p className="text-sm font-semibold text-red-600">Gagal memuat data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F5F9]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-auto overflow-y-auto px-4 py-6 sm:px-8">
          <div className="min-w-[360px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
