import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ClipboardList, FileText, FolderKanban, LayoutGrid, ScrollText, Users } from "lucide-react";import { getRole } from "../auth/role";

const allGroups = [
  {
    label: "Project",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { to: "/project", label: "Project", icon: FolderKanban },
      { to: "/report", label: "Report", icon: FileText },
    ],
  },
  {
    label: "Task",
    items: [
      { to: "/assignment", label: "Task", icon: ClipboardList, match: (path) => path === "/assignment" || path.startsWith("/assignment/edit-task") || path.startsWith("/assignment/subtask") || path === "/assignment/add-task" },
    ],
  },
  {
    label: "Admin",
    roles: ["Superadmin"],
    items: [
      { to: "/admin/project", label: "Project", icon: FolderKanban },
      { to: "/admin/employees", label: "Karyawan", icon: Users },
      { to: "/admin/audit", label: "Audit", icon: ScrollText },
    ],
  },
];

export default function Sidebar({ open = false, onClose }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const role = getRole();
  const navGroups = allGroups.filter((g) => !g.roles || g.roles.includes(role));

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col bg-navy text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:transition-[width] ${
          collapsed ? "w-[84px]" : "w-[254px]"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 1024) {
              onClose?.();
            } else {
              setCollapsed((c) => !c);
            }
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center px-6 pb-6 pt-8"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
            <img src="/logo.png" className="h-14 w-14 rounded-full object-cover" alt="Meditrans" />
          </div>
        </button>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.length === 0 ? (
                !collapsed && (
                  <p className="px-4 text-xs italic text-white/25">Menu personal menyusul.</p>
                )
              ) : (
                group.items.map(({ to, label, icon: Icon, exact, match }) => {
                  const active = match
                    ? match(location.pathname, location.search)
                    : exact
                      ? location.pathname === to
                      : location.pathname.startsWith(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
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
                })
              )}
            </div>
          </div>
        ))}
      </nav>
      </aside>
    </>
  );
}
