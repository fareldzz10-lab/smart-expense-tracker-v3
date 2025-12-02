import React, { useEffect, useState } from "react";
import {
  PieChart,
  List,
  BrainCircuit,
  PlusCircle,
  Sun,
  Moon,
  LogOut,
  Repeat,
  PiggyBank,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { User as UserType } from "../../types";
import { Logo } from "./Logo";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  user: UserType | null;
}

// Interactive Background Component
const InteractiveBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics for the mouse follower
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base Background Color */}
      <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-300" />

      {/* Ambient Floating Orbs (Autonomous Movement) */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -40, 40, 0],
          y: [0, 40, -40, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px]"
      />

      {/* Interactive Mouse Follower */}
      <motion.div
        style={{ x, y }}
        className="absolute top-0 left-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-0 md:opacity-100"
      />

      {/* Noise Overlay for Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" />
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onAddClick,
  isDarkMode,
  toggleTheme,
  onLogout,
  user,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Overview", icon: PieChart },
    { id: "transactions", label: "History", icon: List },
    { id: "budgets", label: "Budgets", icon: Wallet },
    { id: "recurring", label: "Auto", icon: Repeat },
    { id: "savings", label: "Savings", icon: PiggyBank },
    { id: "advisor", label: "Advisor", icon: BrainCircuit },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300 relative overflow-hidden selection:bg-indigo-500 selection:text-white font-sans">
      <InteractiveBackground />

      {/* Desktop Sidebar */}
      <motion.nav
        animate={{ width: isCollapsed ? 80 : 288 }}
        className="hidden md:flex flex-col h-screen sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800/50 z-50 p-4 transition-all duration-300"
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3 px-2"
          } mb-10 overflow-hidden whitespace-nowrap`}
        >
          <div className="relative group cursor-pointer flex-shrink-0">
            <Logo className="w-10 h-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Smart Expense
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Personal Finance
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`relative w-full flex items-center ${
                  isCollapsed ? "justify-center px-0" : "justify-start px-4"
                } gap-3 py-3.5 rounded-2xl transition-all duration-200 group overflow-hidden whitespace-nowrap ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabDesktop"
                    className="absolute inset-0 bg-white dark:bg-slate-800/80 shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="flex-shrink-0 transition-transform group-hover:scale-110"
                  />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Controls */}
        <div className="mt-auto space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddClick}
            className={`w-full py-3.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/10 dark:shadow-indigo-500/20 flex items-center justify-center gap-2 transition-colors overflow-hidden whitespace-nowrap`}
            title={isCollapsed ? "Quick Add" : undefined}
          >
            <PlusCircle size={20} className="flex-shrink-0" />
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Quick Add
              </motion.span>
            )}
          </motion.button>

          <div
            className={`pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center ${
              isCollapsed
                ? "flex-col justify-center gap-4"
                : "justify-between gap-2"
            } overflow-hidden`}
          >
            {/* User Info */}
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "justify-center" : "flex-1 min-w-0"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                {user ? getInitials(user.name) : "U"}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {user?.name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Free Plan
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className={`flex items-center ${
                isCollapsed ? "flex-col gap-2" : "gap-1 shrink-0"
              }`}
            >
              <button
                onClick={toggleTheme}
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-slate-900 dark:text-white">
            Smart Expense
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user && (
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {getInitials(user.name)}
            </div>
          )}
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Floating Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 border border-white/40 dark:border-slate-700/50 z-50 flex items-center justify-between px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 transform -translate-y-1"
                    : ""
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
        {/* Mobile FAB for Add */}
        <button
          onClick={onAddClick}
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center border-4 border-[#F8FAFC] dark:border-[#0B1120] active:scale-95 transition-transform"
        >
          <PlusCircle size={28} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden p-4 pt-20 md:p-8 md:pt-8 scroll-smooth relative z-10">
        <div className="max-w-7xl mx-auto pb-24 md:pb-0">{children}</div>
      </main>
    </div>
  );
};
