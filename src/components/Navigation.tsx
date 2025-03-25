import { Link, useLocation } from "react-router-dom";
import { Home, Cloud, Info, Newspaper, Trophy, User } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Info, label: "About", path: "/about" },
    { icon: Cloud, label: "Weather", path: "/weather" },
    { icon: Newspaper, label: "News", path: "/news" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center px-3 py-1.5 ${
              isActive(item.path)
                ? "text-amber-light"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <item.icon
              className={`nav-icon ${
                isActive(item.path) ? "animate-scale-in" : ""
              }`}
            />
            <span className="nav-text mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
