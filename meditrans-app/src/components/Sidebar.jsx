import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, Truck, FileText, FilePlus2, UserCog, LogOut, Globe2 } from "lucide-react";
import { currentUser } from "../data/mockData";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/assignment", label: "Assignment", icon: Truck, matchExtra: ["/project"] },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/request", label: "Request", icon: FilePlus2 },
  { to: "/admin", label: "Admin", icon: UserCog },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col bg-navy text-white transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[84px]" : "w-[254px]"
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center justify-center px-6 pb-6 pt-8"
      >
        {/* Swap this Globe2 icon for your own <img src="/your-logo.svg" className="h-14 w-14 rounded-full object-cover" .../> when ready */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
          <img src="/logo.png" className="h-14 w-14 rounded-full object-cover" alt="Meditrans" />
        </div>
      </button>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {navItems.map(({ to, label, icon: Icon, matchExtra }) => {
          const active =
            location.pathname.startsWith(to) || matchExtra?.some((p) => location.pathname.startsWith(p));
          return (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-0" : ""
              } ${active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"}`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              {!collapsed && label}
              {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </NavLink>
          );
        })}
      </nav>

      
    </aside>
  );
}