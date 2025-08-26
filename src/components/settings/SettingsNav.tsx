import { Link, useLocation } from "react-router-dom";
import { Palette, Volume2, Sliders } from "lucide-react";

// Interface for settings navigation links
interface SettingsLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const SettingsNav = () => {
  const location = useLocation();

  // Configuration for all settings navigation links
  const links: SettingsLink[] = [
    {
      path: "/settings/theme",
      label: "Theme",
      icon: <Palette size={18} />,
    },
    {
      path: "/settings/sound",
      label: "Sound",
      icon: <Volume2 size={18} />,
    },
    {
      path: "/settings/controls",
      label: "Controls",
      icon: <Sliders size={18} />,
    },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
      <nav className="flex overflow-x-auto py-2">
        <div className="flex space-x-1 px-4">
          {links.map((link) => {
            // Determine if current link is active based on URL path
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default SettingsNav;
