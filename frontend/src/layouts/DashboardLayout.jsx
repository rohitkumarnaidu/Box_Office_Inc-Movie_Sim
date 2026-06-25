import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import { Menu } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: "var(--bg)" }}>
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between p-4 shrink-0" style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>CineVerse</h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 cursor-pointer"
          style={{ color: "var(--muted)" }}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
