import React, { useState, useRef, useEffect, useMemo } from "react";
import { Transaction, TransactionType, User, SavingsGoal } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  Tag,
  Filter,
  X,
  ChevronDown,
  Clock,
  Layers,
  FileText,
  Utensils,
  Car,
  Home,
  Zap,
  Film,
  HeartPulse,
  ShoppingBag,
  Smile,
  GraduationCap,
  Plane,
  Banknote,
  Laptop,
  TrendingUp,
  Gift,
  RotateCcw,
  MoreHorizontal,
  Briefcase,
  Smartphone,
  Landmark,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  List as ListIcon,
  Check,
  Inbox,
  SearchX,
  Settings,
  Globe,
  Edit2,
  RotateCcw as ResetIcon,
  Database,
  Upload,
  Plus,
  Target,
  CalendarRange,
  Coffee,
  Beer,
  ShoppingBasket,
  Bus,
  Train,
  Bike,
  Shirt,
  Gamepad2,
  Music,
  CheckSquare,
  Square,
  Paperclip,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import {
  importTransactions,
  convertAllAmounts,
  getUser,
} from "../services/storageService";
import { getExchangeRate } from "../services/currencyService";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onEdit: (t: Transaction) => void;
  onClearData: () => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
  onAddClick: (type: TransactionType) => void;
  savingsGoals: SavingsGoal[];
}

const CURRENCIES = [
  { code: "IDR", locale: "id-ID", label: "Indonesian Rupiah (IDR)" },
  { code: "USD", locale: "en-US", label: "US Dollar (USD)" },
  { code: "EUR", locale: "de-DE", label: "Euro (EUR)" },
  { code: "GBP", locale: "en-GB", label: "British Pound (GBP)" },
  { code: "JPY", locale: "ja-JP", label: "Japanese Yen (JPY)" },
];

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();

  // Food & Drink
  if (
    normalized.includes("coffee") ||
    normalized.includes("cafe") ||
    normalized.includes("tea") ||
    normalized.includes("starbucks")
  )
    return Coffee;
  if (
    normalized.includes("beer") ||
    normalized.includes("wine") ||
    normalized.includes("bar") ||
    normalized.includes("alcohol") ||
    normalized.includes("drink") ||
    normalized.includes("liquor")
  )
    return Beer;
  if (
    normalized.includes("grocer") ||
    normalized.includes("supermarket") ||
    normalized.includes("mart") ||
    normalized.includes("market") ||
    normalized.includes("pantry")
  )
    return ShoppingBasket;
  if (
    normalized.includes("food") ||
    normalized.includes("dining") ||
    normalized.includes("restaurant") ||
    normalized.includes("lunch") ||
    normalized.includes("dinner") ||
    normalized.includes("snack") ||
    normalized.includes("meal") ||
    normalized.includes("eat")
  )
    return Utensils;

  // Transportation
  if (
    normalized.includes("bus") ||
    normalized.includes("metro") ||
    normalized.includes("subway") ||
    normalized.includes("transit") ||
    normalized.includes("shuttle")
  )
    return Bus;
  if (
    normalized.includes("train") ||
    normalized.includes("rail") ||
    normalized.includes("commuter")
  )
    return Train;
  if (
    normalized.includes("flight") ||
    normalized.includes("plane") ||
    normalized.includes("airline") ||
    normalized.includes("ticket")
  )
    return Plane;
  if (
    normalized.includes("bike") ||
    normalized.includes("motor") ||
    normalized.includes("cycle")
  )
    return Bike;
  if (
    normalized.includes("transport") ||
    normalized.includes("car") ||
    normalized.includes("fuel") ||
    normalized.includes("gas") ||
    normalized.includes("petrol") ||
    normalized.includes("parking") ||
    normalized.includes("taxi") ||
    normalized.includes("uber") ||
    normalized.includes("grab") ||
    normalized.includes("gojek") ||
    normalized.includes("service") ||
    normalized.includes("auto")
  )
    return Car;

  // Shopping & Lifestyle
  if (
    normalized.includes("cloth") ||
    normalized.includes("shirt") ||
    normalized.includes("dress") ||
    normalized.includes("apparel") ||
    normalized.includes("wear") ||
    normalized.includes("fashion")
  )
    return Shirt;
  if (
    normalized.includes("game") ||
    normalized.includes("gaming") ||
    normalized.includes("steam") ||
    normalized.includes("playstation") ||
    normalized.includes("xbox") ||
    normalized.includes("nintendo") ||
    normalized.includes("arcade")
  )
    return Gamepad2;
  if (
    normalized.includes("music") ||
    normalized.includes("spotify") ||
    normalized.includes("concert") ||
    normalized.includes("instrument")
  )
    return Music;
  if (
    normalized.includes("shop") ||
    normalized.includes("buy") ||
    normalized.includes("mall") ||
    normalized.includes("store") ||
    normalized.includes("gadget") ||
    normalized.includes("electronics")
  )
    return ShoppingBag;

  // General Expense Categories
  if (
    normalized.includes("hous") ||
    normalized.includes("rent") ||
    normalized.includes("apartment") ||
    normalized.includes("maintenance") ||
    normalized.includes("mortgage")
  )
    return Home;
  if (
    normalized.includes("utility") ||
    normalized.includes("electric") ||
    normalized.includes("water") ||
    normalized.includes("bill") ||
    normalized.includes("power") ||
    normalized.includes("internet") ||
    normalized.includes("wifi")
  )
    return Zap;
  if (
    normalized.includes("phone") ||
    normalized.includes("mobile") ||
    normalized.includes("data") ||
    normalized.includes("pulsa") ||
    normalized.includes("telco")
  )
    return Smartphone;
  if (
    normalized.includes("entertain") ||
    normalized.includes("movie") ||
    normalized.includes("cinema") ||
    normalized.includes("netflix") ||
    normalized.includes("theatre") ||
    normalized.includes("subscription")
  )
    return Film;
  if (
    normalized.includes("health") ||
    normalized.includes("doctor") ||
    normalized.includes("pharmacy") ||
    normalized.includes("med") ||
    normalized.includes("gym") ||
    normalized.includes("fitness") ||
    normalized.includes("workout") ||
    normalized.includes("hospital")
  )
    return HeartPulse;
  if (
    normalized.includes("personal") ||
    normalized.includes("hair") ||
    normalized.includes("spa") ||
    normalized.includes("salon") ||
    normalized.includes("barber") ||
    normalized.includes("beauty")
  )
    return Smile;
  if (
    normalized.includes("educat") ||
    normalized.includes("school") ||
    normalized.includes("course") ||
    normalized.includes("book") ||
    normalized.includes("tuition") ||
    normalized.includes("training") ||
    normalized.includes("university") ||
    normalized.includes("class")
  )
    return GraduationCap;
  if (
    normalized.includes("travel") ||
    normalized.includes("hotel") ||
    normalized.includes("trip") ||
    normalized.includes("vacation")
  )
    return Plane;

  // Income & Financial
  if (
    normalized.includes("salary") ||
    normalized.includes("wage") ||
    normalized.includes("paycheck") ||
    normalized.includes("income") ||
    normalized.includes("earnings")
  )
    return Banknote;
  if (
    normalized.includes("freelance") ||
    normalized.includes("project") ||
    normalized.includes("contract") ||
    normalized.includes("gig")
  )
    return Laptop;
  if (
    normalized.includes("invest") ||
    normalized.includes("stock") ||
    normalized.includes("crypto") ||
    normalized.includes("trading") ||
    normalized.includes("portfolio") ||
    normalized.includes("dividend") ||
    normalized.includes("mutual")
  )
    return TrendingUp;
  if (
    normalized.includes("business") ||
    normalized.includes("work") ||
    normalized.includes("office") ||
    normalized.includes("corp") ||
    normalized.includes("client") ||
    normalized.includes("operations")
  )
    return Briefcase;
  if (
    normalized.includes("tax") ||
    normalized.includes("gov") ||
    normalized.includes("fee") ||
    normalized.includes("fine") ||
    normalized.includes("penalty") ||
    normalized.includes("irs") ||
    normalized.includes("pajak")
  )
    return Landmark;
  if (
    normalized.includes("transfer") ||
    normalized.includes("credit") ||
    normalized.includes("loan") ||
    normalized.includes("debt")
  )
    return CreditCard;

  // Misc
  if (
    normalized.includes("gift") ||
    normalized.includes("bonus") ||
    normalized.includes("donation") ||
    normalized.includes("charity")
  )
    return Gift;
  if (
    normalized.includes("refund") ||
    normalized.includes("return") ||
    normalized.includes("reimbursement")
  )
    return RotateCcw;
  if (normalized.includes("other") || normalized.includes("misc"))
    return MoreHorizontal;

  return Tag; // Default fallback
};

type SortKey = "date" | "amount";
type SortDirection = "asc" | "desc";

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  onBulkDelete,
  onEdit,
  onClearData,
  user,
  onUpdateUser,
  onAddClick,
  savingsGoals,
}) => {
  const [filter, setFilter] = useState("all"); // all, income, expense
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: "date", direction: "desc" });
  const [isConverting, setIsConverting] = useState(false);

  // Bulk Select State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear selection if mode is turned off
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.locale || "id-ID", {
      style: "currency",
      currency: user?.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCurrencyChange = async (curr: (typeof CURRENCIES)[0]) => {
    if (!user) return;
    const oldCurrency = user.currency || "IDR";

    if (oldCurrency === curr.code) {
      setIsSettingsOpen(false);
      return;
    }

    setIsConverting(true);

    try {
      // 1. Fetch Real-time Exchange Rate (Free API)
      const rate = await getExchangeRate(oldCurrency, curr.code);

      // 2. Ask user preference
      const shouldConvert = window.confirm(
        `Exchange Rate: 1 ${oldCurrency} ≈ ${rate.toFixed(4)} ${
          curr.code
        }.\n\n` +
          `Do you want to convert all your existing transactions, budgets, and goals to ${curr.code}?\n\n` +
          `Click OK to Convert Amounts (Recommended).\n` +
          `Click Cancel to change Symbol only.`
      );

      if (shouldConvert) {
        await convertAllAmounts(rate);
        // Fetch fresh user data to get updated budget
        const updatedUser = await getUser();
        if (updatedUser) {
          onUpdateUser({
            ...updatedUser,
            currency: curr.code,
            locale: curr.locale,
          });
        }
      } else {
        // Just update symbol/locale
        onUpdateUser({ ...user, currency: curr.code, locale: curr.locale });
      }

      window.location.reload(); // Hard refresh to ensure all components re-render with new values
    } catch (error) {
      alert(
        "Failed to fetch exchange rates. Please check your internet connection."
      );
      console.error(error);
      setIsConverting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        if (Array.isArray(importedData)) {
          await importTransactions(importedData);
          window.location.reload();
        } else {
          alert("Invalid file format: Expected an array of transactions.");
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    setIsSettingsOpen(false);
  };

  const handleDatePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value;
    setDatePreset(preset);

    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "thisMonth":
        start.setDate(1);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(""); // Until now/future
        break;
      case "lastMonth":
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setDate(0); // Last day of previous month
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
        break;
      case "last30":
        start.setDate(start.getDate() - 30);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate("");
        break;
      case "thisYear":
        start.setMonth(0, 1);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate("");
        break;
      case "custom":
        // Keep existing date values or reset if empty
        if (!startDate) setStartDate(now.toISOString().split("T")[0]);
        break;
      case "all":
      default:
        setStartDate("");
        setEndDate("");
        break;
    }
  };

  // Get available categories based on current type filter
  const availableCategories: string[] = Array.from(
    new Set<string>(
      transactions
        .filter((t) => filter === "all" || t.type === filter)
        .map((t) => t.category)
    )
  ).sort();

  const sortedTransactions = useMemo(() => {
    let result = transactions.filter((t) => {
      // Type Filter
      const matchesFilter = filter === "all" || t.type === filter;
      // Category Filter
      const matchesCategory = categoryFilter
        ? t.category === categoryFilter
        : true;
      // Search Filter
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      // Date Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const txDate = new Date(t.date);
        const txDateStr = txDate.toLocaleDateString("en-CA");
        if (startDate && txDateStr < startDate) matchesDate = false;
        if (endDate && txDateStr > endDate) matchesDate = false;
      }

      return matchesFilter && matchesSearch && matchesDate && matchesCategory;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortConfig.key === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      return 0;
    });
  }, [
    transactions,
    filter,
    categoryFilter,
    searchTerm,
    startDate,
    endDate,
    sortConfig,
  ]);

  const stats = useMemo(() => {
    return sortedTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [sortedTransactions]);

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFilter("all");
    setCategoryFilter("");
    setDatePreset("all");
    setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    if (isSelectionMode) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTransactions.map((t) => t.id)));
    }
  };

  const handleBulkDeleteAction = () => {
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleSortChange = (key: SortKey, direction: SortDirection) => {
    setSortConfig({ key, direction });
    setIsSortOpen(false);
  };

  const hasActiveFilters =
    searchTerm || startDate || endDate || filter !== "all" || categoryFilter;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return ArrowUpCircle;
      case "expense":
        return ArrowDownCircle;
      default:
        return ListIcon;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-6">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Transactions
              </h2>

              {/* Settings Dropdown */}
              <div className="relative" ref={settingsDropdownRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  disabled={isConverting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isConverting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Settings size={20} />
                  )}
                </button>
                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 origin-top-left"
                    >
                      <button
                        onClick={() => {
                          setIsSelectionMode(!isSelectionMode);
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                      >
                        <CheckSquare size={14} />
                        {isSelectionMode
                          ? "Disable Selection Mode"
                          : "Enable Selection Mode"}
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                      <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                        <span>Currency</span>
                        <Globe size={10} />
                      </div>
                      {CURRENCIES.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => handleCurrencyChange(curr)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            (user?.currency || "IDR") === curr.code
                              ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{curr.code}</span>
                            <span className="text-xs text-slate-400">
                              {curr.label.split("(")[0].trim()}
                            </span>
                          </div>
                          {(user?.currency || "IDR") === curr.code && (
                            <Check size={14} />
                          )}
                        </button>
                      ))}

                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                      >
                        <Upload size={14} />
                        Import Data (JSON)
                      </button>
                      <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImport}
                      />

                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                      <button
                        onClick={() => {
                          onClearData();
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                      >
                        <Database size={14} />
                        Reset Data
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage and view your financial history.
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => onAddClick(TransactionType.INCOME)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm"
            >
              <ArrowUpCircle size={18} /> Add Income
            </button>
            <button
              onClick={() => onAddClick(TransactionType.EXPENSE)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm"
            >
              <ArrowDownCircle size={18} /> Add Expense
            </button>
          </div>
        </div>

        {/* Filter Tabs Row */}
        <div className="flex justify-start items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-auto overflow-x-auto">
            {["all", "income", "expense"].map((f) => {
              const Icon = getTypeIcon(f);
              return (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all z-10 flex items-center gap-2 flex-1 md:flex-none justify-center ${
                    filter === f
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {filter === f && (
                    <motion.div
                      layoutId="activeListFilter"
                      className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-lg -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <Icon
                    size={16}
                    className={
                      filter === f ? "text-indigo-600 dark:text-indigo-400" : ""
                    }
                  />
                  {f}
                </motion.button>
              );
            })}
          </div>

          {/* Toggle Selection Mode Button (Desktop visible, or if mode active) */}
          <button
            onClick={() => setIsSelectionMode(!isSelectionMode)}
            className={`hidden md:flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isSelectionMode
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                : "text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {isSelectionMode ? <CheckSquare size={18} /> : <Square size={18} />}
            {isSelectionMode ? "Cancel Selection" : "Select"}
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <motion.div
        layout
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 transition-all z-20 relative"
      >
        {/* Select All Checkbox (Only visible in selection mode) */}
        {isSelectionMode && (
          <div className="flex items-center pr-2 border-r border-slate-100 dark:border-slate-800">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              {selectedIds.size > 0 &&
              selectedIds.size === sortedTransactions.length ? (
                <CheckSquare className="text-indigo-600" size={20} />
              ) : (
                <Square size={20} />
              )}
              <span className="whitespace-nowrap">Select All</span>
            </button>
          </div>
        )}

        {/* Search Input */}
        <div
          className={`relative group flex-1 transition-all ${
            searchTerm ? "ring-2 ring-indigo-500/20 rounded-xl" : ""
          }`}
        >
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
              searchTerm
                ? "text-indigo-500"
                : "text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500"
            }`}
          />
          <input
            type="text"
            placeholder="Search by description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm w-full transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Category Filter Dropdown */}
          <div className="relative w-full sm:w-auto" ref={categoryDropdownRef}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`flex items-center justify-between gap-2 w-full sm:w-48 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                categoryFilter
                  ? "border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-700"
              } rounded-xl text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-700/50`}
            >
              <div className="flex items-center gap-2 truncate">
                <Filter
                  size={16}
                  className={
                    categoryFilter ? "text-indigo-500" : "text-slate-400"
                  }
                />
                <span
                  className={
                    categoryFilter
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300"
                  }
                >
                  {categoryFilter || "All Categories"}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-full mt-2 left-0 w-full sm:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-30 max-h-80 overflow-y-auto"
                >
                  <button
                    onClick={() => {
                      setCategoryFilter("");
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      !categoryFilter
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-700">
                      <Layers size={14} />
                    </div>
                    All Categories
                    {!categoryFilter && <Check size={14} className="ml-auto" />}
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />

                  {availableCategories.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No categories available for this filter.
                    </div>
                  ) : (
                    availableCategories.map((category) => {
                      const Icon = getCategoryIcon(category);
                      const isSelected = categoryFilter === category;
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            setCategoryFilter(category);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-md ${
                              isSelected
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <span className="truncate">{category}</span>
                          {isSelected && (
                            <Check size={14} className="ml-auto" />
                          )}
                        </button>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date Presets Dropdown */}
          <div className="relative w-full sm:w-auto">
            <div className="relative">
              <CalendarRange
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                value={datePreset}
                onChange={handleDatePresetChange}
                className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                <option value="all">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="last30">Last 30 Days</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto" ref={sortDropdownRef}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between gap-2 w-full sm:w-auto px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-700/50"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  {sortConfig.key === "date"
                    ? sortConfig.direction === "desc"
                      ? "Newest"
                      : "Oldest"
                    : sortConfig.direction === "desc"
                    ? "Amount: High"
                    : "Amount: Low"}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-30"
                >
                  <button
                    onClick={() => handleSortChange("date", "desc")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      sortConfig.key === "date" &&
                      sortConfig.direction === "desc"
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Date: Newest First
                  </button>
                  <button
                    onClick={() => handleSortChange("date", "asc")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      sortConfig.key === "date" &&
                      sortConfig.direction === "asc"
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Date: Oldest First
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                  <button
                    onClick={() => handleSortChange("amount", "desc")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      sortConfig.key === "amount" &&
                      sortConfig.direction === "desc"
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Amount: High to Low
                  </button>
                  <button
                    onClick={() => handleSortChange("amount", "asc")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      sortConfig.key === "amount" &&
                      sortConfig.direction === "asc"
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Amount: Low to High
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date Range Inputs */}
          {(datePreset === "custom" || startDate || endDate) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="flex items-center gap-2 w-full sm:w-auto p-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset("custom");
                  }}
                  className={`w-full sm:w-36 px-3 py-1.5 bg-transparent rounded-lg text-sm focus:outline-none transition-colors ${
                    startDate
                      ? "text-indigo-600 dark:text-indigo-400 font-medium"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                />
              </div>
              <span className="text-slate-300 dark:text-slate-600 font-medium">
                -
              </span>
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset("custom");
                  }}
                  className={`w-full sm:w-36 px-3 py-1.5 bg-transparent rounded-lg text-sm focus:outline-none transition-colors ${
                    endDate
                      ? "text-indigo-600 dark:text-indigo-400 font-medium"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                />
              </div>
            </motion.div>
          )}

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors w-full sm:w-auto justify-center shadow-sm"
            >
              <X size={16} />
              Clear
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Filtered Summary Stats */}
      {sortedTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Income
            </span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              {formatCurrency(stats.income)}
            </span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              Expense
            </span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              {formatCurrency(stats.expense)}
            </span>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              Net
            </span>
            <span
              className={`font-bold text-lg ${
                stats.income - stats.expense >= 0
                  ? "text-slate-900 dark:text-white"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatCurrency(stats.income - stats.expense)}
            </span>
          </div>
        </motion.div>
      )}

      <div className="space-y-4 pb-20">
        <AnimatePresence mode="popLayout">
          {sortedTransactions.map((t, index) => {
            const CategoryIcon = getCategoryIcon(t.category);
            const isIncome = t.type === TransactionType.INCOME;
            const linkedGoal = t.linkedGoalId
              ? savingsGoals.find((g) => g.id === t.linkedGoalId)
              : null;
            const isSelected = selectedIds.has(t.id);

            return (
              <motion.div
                layout
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileHover={{ scale: 1.01, zIndex: 10 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  isSelectionMode ? toggleSelect(t.id) : toggleExpand(t.id)
                }
                className={`group bg-white dark:bg-slate-900 p-5 sm:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-indigo-100 dark:hover:border-indigo-900/30 relative overflow-hidden cursor-pointer ${
                  expandedId === t.id
                    ? "ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 bg-slate-50/80 dark:bg-slate-800/50"
                    : ""
                } ${
                  isSelected
                    ? "ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:ring-indigo-500"
                    : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-10">
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckSquare
                          className="text-indigo-600 dark:text-indigo-400"
                          size={24}
                        />
                      ) : (
                        <Square
                          className="text-slate-300 dark:text-slate-600"
                          size={24}
                        />
                      )}
                    </div>
                  )}

                  {/* Main Visual: Category Icon with Type Coloring */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 shadow-sm relative group-hover:scale-110 group-hover:shadow-md ${
                      isIncome
                        ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-600 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-400"
                        : "bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200 text-rose-600 dark:from-rose-500/10 dark:to-rose-500/5 dark:border-rose-500/20 dark:text-rose-400"
                    }`}
                  >
                    <CategoryIcon size={24} strokeWidth={2} />

                    {/* Small Type Indicator Badge */}
                    <div
                      className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-[3px] border-white dark:border-slate-900 shadow-sm ${
                        isIncome
                          ? "bg-emerald-500 text-white"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight size={12} strokeWidth={3} />
                      ) : (
                        <ArrowDownRight size={12} strokeWidth={3} />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1.5">
                        {/* Category Name - Primary */}
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {t.category}
                          </h3>
                          {linkedGoal && expandedId !== t.id && (
                            <div className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                              <Target size={10} /> Goal
                            </div>
                          )}
                          {t.attachment && expandedId !== t.id && (
                            <div className="text-slate-400 dark:text-slate-500">
                              <Paperclip size={14} />
                            </div>
                          )}
                        </div>

                        {/* Meta Row - Secondary Info */}
                        <div className="flex items-center flex-wrap gap-2 text-sm mt-0.5">
                          {/* Date Badge */}
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                            <Calendar size={10} strokeWidth={2.5} />
                            {new Date(t.date).toLocaleDateString(
                              user?.locale || "id-ID",
                              { month: "short", day: "numeric" }
                            )}
                          </span>

                          {/* Description (if exists and not expanded) */}
                          {t.description && expandedId !== t.id && (
                            <div className="flex items-center gap-2 max-w-full overflow-hidden border-l-2 border-slate-200 dark:border-slate-700 pl-2">
                              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[300px] text-sm font-medium">
                                {t.description}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Amount & Expand Chevron */}
                      <div className="flex flex-col items-end gap-1 pl-2">
                        <span
                          className={`font-bold text-lg whitespace-nowrap tracking-tight ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {isIncome ? "+" : "-"} {formatCurrency(t.amount)}
                        </span>

                        {!isSelectionMode && (
                          <ChevronDown
                            size={18}
                            className={`text-slate-300 dark:text-slate-600 transition-transform duration-300 hidden sm:block ${
                              expandedId === t.id
                                ? "rotate-180 text-indigo-500 dark:text-indigo-400"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Desktop) */}
                  {!isSelectionMode && (
                    <div className="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1, color: "#6366f1" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(t);
                        }}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 size={18} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(t.id);
                        }}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  )}

                  {/* Mobile Chevron */}
                  {!isSelectionMode && (
                    <div
                      className={`sm:hidden absolute bottom-0 right-0 text-slate-300 dark:text-slate-600 transition-transform duration-300 ${
                        expandedId === t.id
                          ? "rotate-180 text-indigo-500 dark:text-indigo-400"
                          : ""
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === t.id && !isSelectionMode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="overflow-hidden"
                    >
                      <div
                        className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 cursor-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} />
                            <h4 className="text-xs font-bold uppercase tracking-wider">
                              Date & Time
                            </h4>
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 pl-1">
                            {new Date(t.date).toLocaleString(
                              user?.locale || "id-ID",
                              { dateStyle: "full", timeStyle: "short" }
                            )}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Layers size={14} />
                            <h4 className="text-xs font-bold uppercase tracking-wider">
                              Category & Type
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 pl-1">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[100%] font-bold uppercase tracking-wide border ${
                                t.type === TransactionType.INCOME
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                  : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                              }`}
                            >
                              {t.type}
                            </span>
                            <div className="flex items-center gap-2">
                              <CategoryIcon
                                size={16}
                                className="text-slate-500 dark:text-slate-400"
                              />
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t.category}
                              </p>
                            </div>
                          </div>
                        </div>

                        {linkedGoal && (
                          <div className="sm:col-span-2 space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Target size={14} />
                              <h4 className="text-xs font-bold uppercase tracking-wider">
                                Linked Savings Goal
                              </h4>
                            </div>
                            <div className="flex items-center gap-3 pl-1 bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                              <div
                                className={`w-3 h-3 rounded-full ${linkedGoal.color}`}
                              />
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Contribution to{" "}
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {linkedGoal.name}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="sm:col-span-2 space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <FileText size={14} />
                            <h4 className="text-xs font-bold uppercase tracking-wider">
                              Description / Notes
                            </h4>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {t.description || (
                                <span className="italic text-slate-400">
                                  No additional description provided.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {t.attachment && (
                          <div className="sm:col-span-2 space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Paperclip size={14} />
                              <h4 className="text-xs font-bold uppercase tracking-wider">
                                Receipt
                              </h4>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img
                                src={t.attachment}
                                alt="Receipt"
                                className="w-full max-h-64 object-contain bg-slate-100 dark:bg-slate-800"
                              />
                            </div>
                          </div>
                        )}

                        {/* Mobile Actions */}
                        <div className="sm:hidden flex gap-2 mt-2">
                          <button
                            onClick={() => onEdit(t)}
                            className="flex-1 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(t.id)}
                            className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
          >
            {transactions.length === 0 ? (
              // Case: No transactions at all
              <>
                <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-indigo-50/50 dark:ring-slate-800/50">
                  <Inbox
                    className="w-10 h-10 text-indigo-400 dark:text-slate-500"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  Your list is empty
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                  It looks like you haven't added any transactions yet. Use the
                  buttons above to get started!
                </p>
              </>
            ) : (
              // Case: No matches for filters
              <>
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-slate-50/50 dark:ring-slate-800/50">
                  <SearchX
                    className="w-10 h-10 text-slate-400 dark:text-slate-500"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  No matches found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                  We couldn't find any transactions matching your current
                  filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                {selectedIds.size} Selected
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Actions:
              </span>
            </div>

            <button
              onClick={handleBulkDeleteAction}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-colors"
            >
              <Trash2 size={18} /> Delete Selected
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

            <button
              onClick={() => setIsSelectionMode(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
