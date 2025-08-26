import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Play,
  Trophy,
  HelpCircle,
  Settings,
  LogOut,
  User,
  BarChart,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColorTheme } from "../../contexts/ColorThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useColorTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<number>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle user logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await logout();
      if (result?.error) {
        throw result.error;
      }
      setDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Extract user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return "?";
    return user.username.substring(0, 2).toUpperCase();
  };

  // Handle dropdown hover interactions
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHovering(false);
      if (!dropdownOpen) {
        setDropdownOpen(false);
      }
    }, 300);
  };

  // Navigation items configuration
  const navItems = [
    { to: "/play", icon: <Play size={18} />, label: "Play" },
    { to: "/leaderboard", icon: <Trophy size={18} />, label: "Leaderboard" },
    { to: "/help", icon: <HelpCircle size={18} />, label: "Help" },
    { to: "/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              Simon Says
            </Link>

            {/* Desktop navigation menu */}
            {user && (
              <div className="hidden md:flex items-center ml-10 space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link flex items-center gap-2 ${isActive ? "nav-link-active" : ""}`
                    }
                  >
                    {item.icon}
                    <span className="hidden lg:inline">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User profile dropdown */}
            {user ? (
              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-expanded={dropdownOpen || isHovering}
                  aria-haspopup="true"
                >
                  <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium">
                    {getUserInitials()}
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-slate-500 dark:text-slate-400"
                  />
                </button>

                {/* Dropdown menu */}
                {(dropdownOpen || isHovering) && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg overflow-hidden z-10 border border-slate-200 dark:border-slate-700">
                    {/* User info header */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </div>
                    </div>
                    <div className="py-1">
                      {/* Mobile Navigation Items */}
                      <div className="md:hidden border-b border-slate-200 dark:border-slate-700">
                        {navItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/stats"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                      >
                        <BarChart size={16} /> Stats & Achievements
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                      >
                        <User size={16} /> Account Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
