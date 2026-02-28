import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { path: "/", icon: "🏟️", label: "Games" },
  { path: "/create", icon: "➕", label: "Create" },
  { path: "/my-games", icon: "⭐", label: "My Games" },
  { path: "/profile", icon: "👤", label: "Profile" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex justify-around bg-gradient-to-t from-brand-dark via-brand-dark/95 to-transparent backdrop-blur-xl pt-3 pb-5 z-50 border-t border-brand-border">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all ${
              active ? "bg-brand-orange/10" : ""
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span
              className={`text-[10px] font-semibold tracking-wide ${
                active ? "text-brand-orange" : "text-gray-600"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
