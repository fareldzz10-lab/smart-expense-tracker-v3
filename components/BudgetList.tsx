import React, { useState, useMemo } from "react";
import { Budget, Transaction, User, TransactionType } from "../types";
import {
  addBudget,
  deleteBudget,
  updateBudget,
} from "../services/storageService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Check,
  X,
  Coffee,
  Beer,
  ShoppingBasket,
  Utensils,
  Bus,
  Train,
  Plane,
  Bike,
  Car,
  Shirt,
  Gamepad2,
  Music,
  ShoppingBag,
  Home,
  Zap,
  Smartphone,
  Film,
  HeartPulse,
  Smile,
  GraduationCap,
  Banknote,
  Laptop,
  TrendingUp,
  Briefcase,
  Landmark,
  CreditCard,
  Gift,
  RotateCcw,
  MoreHorizontal,
  Tag,
} from "lucide-react";
import { generateUUID, getCurrencySymbol } from "../utils";
import { CATEGORIES } from "../constants";

// Helper to reuse icon logic
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

  return Tag;
};

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
  onRefresh: () => void;
  user: User | null;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  transactions,
  onRefresh,
  user,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.locale || "id-ID", {
      style: "currency",
      currency: user?.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === TransactionType.EXPENSE &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });
  }, [transactions]);

  const budgetStats = useMemo(() => {
    return budgets.map((budget) => {
      const spent = currentMonthTransactions
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...budget, spent };
    });
  }, [budgets, currentMonthTransactions]);

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpentTracked = budgetStats.reduce((sum, b) => sum + b.spent, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return;

    const budgetData = {
      category,
      limit: parseFloat(limit),
      period: "monthly" as const,
    };

    if (editingId) {
      await updateBudget({ ...budgetData, id: editingId });
    } else {
      await addBudget({ ...budgetData, id: generateUUID() });
    }

    onRefresh();
    resetForm();
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setCategory(budget.category);
    setLimit(budget.limit.toString());
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this budget category?")) {
      await deleteBudget(id);
      onRefresh();
    }
  };

  const resetForm = () => {
    setCategory("");
    setLimit("");
    setIsAdding(false);
    setEditingId(null);
  };

  const availableCategories = CATEGORIES[TransactionType.EXPENSE].filter(
    (c) => !budgets.some((b) => b.category === c && b.id !== editingId)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-indigo-500" />
            Monthly Budgets
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
            Set spending limits for specific categories to keep your finances on
            track.
          </p>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            else setIsAdding(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          {isAdding ? (
            "Cancel"
          ) : (
            <>
              <Plus size={20} /> Set Budget
            </>
          )}
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1 w-full">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Budgeted
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalBudgeted)}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{
                width: `${Math.min(
                  (totalSpentTracked / (totalBudgeted || 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
            <span>Spent: {formatCurrency(totalSpentTracked)}</span>
            <span>
              {totalBudgeted > 0
                ? Math.round((totalSpentTracked / totalBudgeted) * 100)
                : 0}
              % used
            </span>
          </div>
        </div>
        <div className="hidden md:block w-px h-16 bg-slate-100 dark:bg-slate-800" />
        <div className="text-center md:text-right">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Remaining
          </span>
          <span
            className={`text-2xl font-bold ${
              totalBudgeted - totalSpentTracked >= 0
                ? "text-emerald-500"
                : "text-rose-500"
            }`}
          >
            {formatCurrency(totalBudgeted - totalSpentTracked)}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSave}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingId ? "Edit Budget" : "Set New Budget"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tag
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      list="budget-categories"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Select category..."
                    />
                    <datalist id="budget-categories">
                      {availableCategories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Monthly Limit
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      {getCurrencySymbol(
                        user?.locale || "id-ID",
                        user?.currency || "IDR"
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
              >
                {editingId ? "Update Budget" : "Save Budget"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetStats.map((budget) => {
          const CategoryIcon = getCategoryIcon(budget.category);
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);

          let statusColor = "bg-emerald-500";
          let statusText = "text-emerald-500";
          let bgSoft = "bg-emerald-50 dark:bg-emerald-900/20";

          if (percentage >= 100) {
            statusColor = "bg-rose-500";
            statusText = "text-rose-500";
            bgSoft = "bg-rose-50 dark:bg-rose-900/20";
          } else if (percentage >= 80) {
            statusColor = "bg-amber-500";
            statusText = "text-amber-500";
            bgSoft = "bg-amber-50 dark:bg-amber-900/20";
          }

          return (
            <motion.div
              layout
              key={budget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${bgSoft} ${statusText}`}>
                    <CategoryIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                      {budget.category}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Monthly Limit
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-2 relative z-10">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-xl font-bold ${statusText}`}>
                    {formatCurrency(budget.spent)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    / {formatCurrency(budget.limit)}
                  </span>
                </div>

                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${statusColor}`}
                  />
                </div>
              </div>

              {percentage >= 100 && (
                <div className="mt-3 flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 py-2 px-3 rounded-xl">
                  <AlertCircle size={14} />
                  <span>
                    Over budget by {formatCurrency(budget.spent - budget.limit)}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}

        {budgetStats.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
              <Wallet className="text-slate-300" size={32} />
            </div>
            <p>No budgets set. Click "Set Budget" to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
};
