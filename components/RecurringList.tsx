import React, { useState } from "react";
import {
  RecurringTransaction,
  TransactionType,
  User,
  SavingsGoal,
} from "../types";
import {
  addRecurringTransaction,
  deleteRecurringTransaction,
  updateRecurringTransaction,
} from "../services/storageService";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  Plus,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Calendar,
  Tag,
  List,
  CheckCircle2,
  FolderSync,
  X,
  Target,
  Edit2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { CATEGORIES } from "../constants";
import { generateUUID, getCurrencySymbol } from "../utils";

interface RecurringListProps {
  recurringRules: RecurringTransaction[];
  onRefresh: () => void;
  user: User | null;
  savingsGoals: SavingsGoal[];
}

export const RecurringList: React.FC<RecurringListProps> = ({
  recurringRules,
  onRefresh,
  user,
  savingsGoals,
}) => {
  const [activeForm, setActiveForm] = useState<TransactionType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [linkedGoalId, setLinkedGoalId] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.locale || "id-ID", {
      style: "currency",
      currency: user?.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currencySymbol = getCurrencySymbol(
    user?.locale || "id-ID",
    user?.currency || "IDR"
  );

  const openForm = (type: TransactionType) => {
    resetForm();
    setActiveForm(type);
  };

  const closeForm = () => {
    setActiveForm(null);
    resetForm();
  };

  const handleEdit = (rule: RecurringTransaction) => {
    setEditingId(rule.id);
    setAmount(rule.amount.toString());
    setCategory(rule.category);
    setDescription(rule.description);
    setFrequency(rule.frequency);
    setStartDate(rule.startDate.split("T")[0]);
    setLinkedGoalId(rule.linkedGoalId || "");
    setActiveForm(rule.type);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !activeForm) return;

    const ruleData = {
      amount: parseFloat(amount),
      category,
      description,
      type: activeForm,
      frequency,
      startDate: new Date(startDate).toISOString(),
      linkedGoalId: linkedGoalId || undefined,
    };

    if (editingId) {
      // Update existing
      const originalRule = recurringRules.find((r) => r.id === editingId);
      if (originalRule) {
        await updateRecurringTransaction({
          ...originalRule,
          ...ruleData,
          // Note: We typically preserve the nextDueDate unless logic dictates otherwise.
          // For this simple implementation, we keep the schedule flowing.
        });
      }
    } else {
      // Create new
      await addRecurringTransaction({
        ...ruleData,
        id: generateUUID(),
        nextDueDate: new Date(startDate).toISOString(),
        active: true,
      });
    }

    onRefresh();
    closeForm();
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Delete this recurring rule? Future transactions will not be generated."
      )
    ) {
      await deleteRecurringTransaction(id);
      onRefresh();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setAmount("");
    setCategory("");
    setDescription("");
    setFrequency("monthly");
    setStartDate(new Date().toISOString().split("T")[0]);
    setLinkedGoalId("");
  };

  const incomeRules = recurringRules.filter(
    (r) => r.type === TransactionType.INCOME
  );
  const expenseRules = recurringRules.filter(
    (r) => r.type === TransactionType.EXPENSE
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FolderSync className="w-8 h-8 text-indigo-500" />
            Automation
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
            Manage your fixed income and expenses. Rules automatically generate
            transactions when due.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openForm(TransactionType.INCOME)}
            disabled={!!activeForm && activeForm !== TransactionType.INCOME}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
          >
            <ArrowUpCircle size={20} /> Add Income
          </button>
          <button
            onClick={() => openForm(TransactionType.EXPENSE)}
            disabled={!!activeForm && activeForm !== TransactionType.EXPENSE}
            className="flex items-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 transition-all active:scale-95"
          >
            <ArrowDownCircle size={20} /> Add Expense
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeForm && (
          <motion.div
            key={activeForm}
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSave}
              className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm space-y-6 relative ${
                activeForm === TransactionType.INCOME
                  ? "border-emerald-100 dark:border-emerald-900/30"
                  : "border-rose-100 dark:border-rose-900/30"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    activeForm === TransactionType.INCOME
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {activeForm === TransactionType.INCOME ? (
                    <ArrowUpCircle />
                  ) : (
                    <ArrowDownCircle />
                  )}
                  {editingId ? "Edit Recurring" : "New Recurring"}{" "}
                  {activeForm === TransactionType.INCOME ? "Income" : "Expense"}
                </h3>
                <button
                  type="button"
                  onClick={closeForm}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm w-5 text-center">
                      {currencySymbol}
                    </div>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <List
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      list="rec-category-options"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Rent, Netflix, Salary..."
                    />
                    <datalist id="rec-category-options">
                      {CATEGORIES[activeForm].map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Frequency
                  </label>
                  <div className="relative">
                    <RefreshCw
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {savingsGoals.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Auto-Contribute to Savings (Optional)
                  </label>
                  <div className="relative">
                    <Target
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      value={linkedGoalId}
                      onChange={(e) => setLinkedGoalId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      <option value="">Do not link</option>
                      {savingsGoals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          Contribute to: {goal.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Monthly Apartment Rent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-bold rounded-xl transition-colors ${
                  activeForm === TransactionType.INCOME
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {editingId ? "Update" : "Save"} Recurring{" "}
                {activeForm === TransactionType.INCOME ? "Income" : "Expense"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Income Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <ArrowUpCircle className="text-emerald-500" /> Recurring Income
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {incomeRules.length > 0 ? (
            incomeRules.map((rule) => (
              <RecurringCard
                key={rule.id}
                rule={rule}
                onDelete={handleDelete}
                onEdit={handleEdit}
                formatCurrency={formatCurrency}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              No recurring income set.
            </div>
          )}
        </div>
      </div>

      {/* Expense Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <ArrowDownCircle className="text-rose-500" /> Recurring Expenses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expenseRules.length > 0 ? (
            expenseRules.map((rule) => (
              <RecurringCard
                key={rule.id}
                rule={rule}
                onDelete={handleDelete}
                onEdit={handleEdit}
                formatCurrency={formatCurrency}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              No recurring expenses set.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual card
interface RecurringCardProps {
  rule: RecurringTransaction;
  onDelete: (id: string) => void;
  onEdit: (rule: RecurringTransaction) => void;
  formatCurrency: (val: number) => string;
}

const RecurringCard: React.FC<RecurringCardProps> = ({
  rule,
  onDelete,
  onEdit,
  formatCurrency,
}) => {
  const getNextDueText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return <span className="text-rose-500 font-bold">Overdue</span>;
    if (diffDays === 0)
      return <span className="text-emerald-500 font-bold">Due Today</span>;
    if (diffDays === 1)
      return <span className="text-amber-500 font-bold">Due Tomorrow</span>;
    return (
      <span className="text-slate-500 dark:text-slate-400">
        Due in {diffDays} days
      </span>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Background Decor */}
      <div
        className={`absolute top-0 right-0 p-12 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2 ${
          rule.type === TransactionType.INCOME
            ? "bg-emerald-500"
            : "bg-rose-500"
        }`}
      />

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${
              rule.type === TransactionType.INCOME
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
            }`}
          >
            <CalendarClock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
              {rule.category}
            </h3>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="capitalize font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                {rule.frequency}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(rule)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between relative z-10">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Amount
          </span>
          <span
            className={`text-2xl font-bold ${
              rule.type === TransactionType.INCOME
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-800 dark:text-slate-200"
            }`}
          >
            {formatCurrency(rule.amount)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Next Payment
          </span>
          <div className="flex items-center justify-end gap-1.5 text-sm">
            <Clock size={14} className="text-slate-400" />
            {getNextDueText(rule.nextDueDate)}
          </div>
        </div>
      </div>

      {(rule.description || rule.linkedGoalId) && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-medium gap-2">
          {rule.description ? (
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {rule.description}
            </span>
          ) : (
            <span></span>
          )}

          {rule.linkedGoalId && (
            <div className="flex items-center gap-1 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
              <Target size={12} />
              Linked to Savings
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
