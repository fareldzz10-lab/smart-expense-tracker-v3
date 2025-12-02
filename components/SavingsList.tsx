import React, { useState } from "react";
import { SavingsGoal, User, TransactionType } from "../types";
import {
  addSavingsGoal,
  deleteSavingsGoal,
  updateSavingsGoal,
  addTransaction,
} from "../services/storageService";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  Plus,
  Trash2,
  Target,
  Calendar,
  Edit2,
  TrendingUp,
  DollarSign,
  Check,
  X,
  Wallet,
} from "lucide-react";
import { generateUUID, triggerConfetti, triggerFireworks } from "../utils";

interface SavingsListProps {
  savingsGoals: SavingsGoal[];
  onRefresh: () => void;
  user: User | null;
}

const COLORS = [
  {
    name: "Emerald",
    value: "bg-emerald-500",
    text: "text-emerald-500",
    bgSoft: "bg-emerald-50",
  },
  {
    name: "Blue",
    value: "bg-blue-500",
    text: "text-blue-500",
    bgSoft: "bg-blue-50",
  },
  {
    name: "Indigo",
    value: "bg-indigo-500",
    text: "text-indigo-500",
    bgSoft: "bg-indigo-50",
  },
  {
    name: "Violet",
    value: "bg-violet-500",
    text: "text-violet-500",
    bgSoft: "bg-violet-50",
  },
  {
    name: "Rose",
    value: "bg-rose-500",
    text: "text-rose-500",
    bgSoft: "bg-rose-50",
  },
  {
    name: "Amber",
    value: "bg-amber-500",
    text: "text-amber-500",
    bgSoft: "bg-amber-50",
  },
];

export const SavingsList: React.FC<SavingsListProps> = ({
  savingsGoals,
  onRefresh,
  user,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [depositAmount, setDepositAmount] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.locale || "id-ID", {
      style: "currency",
      currency: user?.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    const goalData = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(initialAmount) || 0,
      deadline: deadline || undefined,
      color: selectedColor.value,
    };

    if (editingGoalId) {
      await updateSavingsGoal({ ...goalData, id: editingGoalId });
    } else {
      await addSavingsGoal({ ...goalData, id: generateUUID() });
    }

    onRefresh();
    resetForm();
    setIsAdding(false);
    setEditingGoalId(null);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoalId(goal.id);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setInitialAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline || "");
    const colorObj = COLORS.find((c) => c.value === goal.color) || COLORS[0];
    setSelectedColor(colorObj);
    setIsAdding(true);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) return;

    const goal = savingsGoals.find((g) => g.id === depositGoalId);
    if (goal) {
      const amount = parseFloat(depositAmount);
      // Create a linked transaction (Expense) to represent money moving to savings
      await addTransaction({
        id: generateUUID(),
        amount: amount,
        category: "Savings",
        description: `Deposit to ${goal.name}`,
        type: TransactionType.EXPENSE,
        date: new Date().toISOString(),
        linkedGoalId: goal.id,
      });

      // Check for completion celebration
      const newAmount = goal.currentAmount + amount;
      if (newAmount >= goal.targetAmount) {
        triggerFireworks();
      } else {
        triggerConfetti();
      }

      onRefresh();
      setDepositGoalId(null);
      setDepositAmount("");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this savings goal?")) {
      await deleteSavingsGoal(id);
      onRefresh();
    }
  };

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setInitialAmount("");
    setDeadline("");
    setSelectedColor(COLORS[0]);
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <PiggyBank className="w-8 h-8 text-indigo-500" />
            Savings Goals
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
            Track your progress towards financial targets. Set deadlines and
            watch your savings grow.
          </p>
        </div>
        <button
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingGoalId(null);
              resetForm();
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          {isAdding ? (
            "Cancel"
          ) : (
            <>
              <Plus size={20} /> New Goal
            </>
          )}
        </button>
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
                  {editingGoalId ? "Edit Goal" : "Create New Goal"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. New Laptop"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Color Theme
                  </label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`w-10 h-10 rounded-full ${
                          c.value
                        } flex items-center justify-center transition-transform ${
                          selectedColor.name === c.name
                            ? "scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        {selectedColor.name === c.name && (
                          <Check size={16} className="text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Target Amount
                  </label>
                  <div className="relative">
                    <Target
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="number"
                      required
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Current Saved
                  </label>
                  <div className="relative">
                    <Wallet
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="number"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Deadline (Optional)
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
              >
                {editingGoalId ? "Update Goal" : "Create Goal"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const progress = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100
          );
          const daysLeft = getDaysLeft(goal.deadline);
          const colorObj =
            COLORS.find((c) => c.value === goal.color) || COLORS[0];

          return (
            <motion.div
              layout
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${colorObj.bgSoft} dark:bg-opacity-10 ${colorObj.text}`}
                    >
                      <Target size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                        {goal.name}
                      </h3>
                      {goal.deadline && (
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {daysLeft !== null && daysLeft <= 0
                            ? "Due Today"
                            : `${daysLeft} days left`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-slate-300 hover:text-indigo-500 transition-colors p-1"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-2 flex justify-between items-end">
                  <span className={`text-2xl font-bold ${colorObj.text}`}>
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    of {formatCurrency(goal.targetAmount)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${goal.color}`}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>{progress.toFixed(1)}%</span>
                  {progress >= 100 && (
                    <span className="text-green-500 flex items-center gap-1">
                      <Check size={12} /> Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Deposit Action Area */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800">
                {depositGoalId === goal.id ? (
                  <form onSubmit={handleDeposit} className="flex gap-2">
                    <input
                      autoFocus
                      type="number"
                      placeholder="Amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositGoalId(null)}
                      className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setDepositGoalId(goal.id)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                      progress >= 100
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm"
                    }`}
                    disabled={progress >= 100}
                  >
                    <Plus size={16} /> Add Funds
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Create Card (Empty State) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingGoalId(null);
            resetForm();
            setIsAdding(true);
          }}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors min-h-[250px]"
        >
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
            <Plus size={32} />
          </div>
          <span className="font-bold">Create New Goal</span>
        </motion.button>
      </div>
    </div>
  );
};
