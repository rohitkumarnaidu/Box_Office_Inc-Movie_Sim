import {
  LayoutDashboard,
  Film,
  Users,
  Building2,
  TrendingUp,
  FileBarChart,
  Pen,
  Bell,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Scripts",
      path: "/scripts",
      icon: Film,
    },
    {
      name: "Writers",
      path: "/writers",
      icon: Pen,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      name: "Talent",
      path: "/talent",
      icon: Users,
    },
    {
      name: "Studio",
      path: "/studio",
      icon: Building2,
    },
    {
      name: "Market",
      path: "/market",
      icon: TrendingUp,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileBarChart,
    },
  ];

  return (
    <aside className="w-72 bg-[#0B1020] border-r border-slate-800 p-6 flex flex-col">
      <h1 className="text-3xl font-bold text-violet-500 mb-10">CineVerse</h1>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                transition-all
                duration-200
                ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }
              `}
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
