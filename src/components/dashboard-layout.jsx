import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { useTheme } from "../contexts/theme-context";
import { logoutUser } from "../services/api";

export default function DashboardLayout({ children, role }) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const shellBg = isDark ? "#0F172A" : "#F8FAFC";
  const sidebarBg = isDark ? "#111827" : "#FFFFFF";
  const headerBg = isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.9)";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const brandText = isDark ? "#F1F5F9" : "#0F172A";
  const inactiveText = isDark ? "#CBD5E1" : "#475569";
  const activeBg = isDark ? "rgba(79,70,229,0.2)" : "#EEF2FF";
  const activeText = "#4F46E5";

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const candidateNavItems = [
    { href: "/candidate/dashboard", label: "Dashboard", icon: "home" },
    { href: "/candidate/video-interview", label: "Video Interview", icon: "video" },
    { href: "/upload", label: "Upload Resume", icon: "upload" },
    { href: "/profile", label: "Profile", icon: "user" },
    { href: "/practice", label: "Practice", icon: "practice" },
    { href: "/practice/code", label: "Code Practice", icon: "code" },
    { href: "/history", label: "History", icon: "history" },
  ];

  const recruiterNavItems = [
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: "home" },
    { href: "/recruiter/interviews", label: "Interviews", icon: "calendar" },
  ];

  const navItems = role === "candidate" ? candidateNavItems : recruiterNavItems;

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      upload: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3-3m0 0l-3 3m3-3v12M5 20h14" />
        </svg>
      ),
      user: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      practice: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      users: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
        </svg>
      ),
      calendar: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      history: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      code: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </svg>
      ),
      video: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-9 4h8a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    };
    return icons[iconName];
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: shellBg }}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ backgroundColor: sidebarBg, borderColor }}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6" style={{ borderColor }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 font-bold text-white shadow-sm">
            IS
          </div>
          <span className="text-lg font-bold" style={{ color: brandText }}>
            Interview<span style={{ color: "#4F46E5" }}>Sync</span>
          </span>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${pathname === item.href
                ? "font-semibold"
                : isDark ? "font-medium hover:bg-slate-800" : "font-medium hover:bg-slate-100 hover:text-slate-900"
                }`}
              style={
                pathname === item.href
                  ? { backgroundColor: activeBg, color: activeText }
                  : { color: inactiveText }
              }
            >
              {getIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Button
            onClick={handleLogoutClick}
            variant="ghost"
            className="w-full text-sm font-semibold bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all shadow-sm hover:shadow-md hover:shadow-red-500/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:pl-64">
        <header
          className="sticky top-0 z-30 border-b backdrop-blur-md"
          style={{ backgroundColor: headerBg, borderColor }}
        >
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              ☰
            </Button>

            <div className="flex flex-1 items-center justify-between">
              <div className="text-sm font-medium" style={{ color: inactiveText }}>
                Welcome, <span className="font-semibold" style={{ color: "#4F46E5" }}>{role === "candidate" ? "Candidate" : "Recruiter"}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        isDangerous={true}
      />
    </div>
  );
}
