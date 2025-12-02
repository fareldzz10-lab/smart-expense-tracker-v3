import React, { useMemo, useEffect, useRef, useState } from "react";
import { Transaction, TransactionType, User } from "../types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion, animate, useInView, Variants } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  List,
  Download,
  Edit2,
  Target,
  PiggyBank,
  ClipboardList,
  Database,
  FileJson,
  Gauge,
} from "lucide-react";
const MotionDiv = motion.div as any;

interface DashboardProps {
  transactions: Transaction[];
  isDarkMode: boolean;
  user: User | null;
  onUpdateUser: (user: User) => void;
}

// Animated Counter Component with Spring Physics
const AnimatedCounter = ({
  value,
  formatter,
}: {
  value: number;
  formatter: (val: number) => string;
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (!isInView) return;

    const node = nodeRef.current;
    const from = prevValueRef.current;
    const to = value;

    const controls = animate(from, to, {
      duration: 1.5,
      ease: [0.34, 1.56, 0.64, 1], // Spring-like ease
      onUpdate(v) {
        if (node) node.textContent = formatter(v);
      },
    });

    prevValueRef.current = to;

    return () => controls.stop();
  }, [value, isInView, formatter]);

  return <span ref={nodeRef} />;
};

// Stagger Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const HealthGauge = ({ score }: { score: number }) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  // Calculate rotation: 0 score = -90deg, 100 score = 90deg
  const rotation = (clampedScore / 100) * 180 - 90;

  let color = "#ef4444"; // red
  if (clampedScore > 40) color = "#f59e0b"; // orange
  if (clampedScore > 70) color = "#10b981"; // green
  if (clampedScore > 90) color = "#6366f1"; // indigo

  return (
    <div className="relative w-48 h-24 mx-auto overflow-hidden">
      {/* Background Arc */}
      <div
        className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 dark:border-slate-800"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
      ></div>

      {/* Colored Arc (Simple solid color for simplicity in SVG rotation or use conic-gradient in CSS) */}
      {/* We will use a rotational approach for the needle, but for the bar we can use CSS rotation */}
      <div
        className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-transparent"
        style={{
          borderColor: color,
          clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
          transform: `rotate(${rotation}deg)`,
          transition:
            "transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 1s ease",
          opacity: 0.2, // Faint trail
        }}
      />

      {/* Needle */}
      <div className="absolute bottom-0 left-1/2 w-full h-full -translate-x-1/2 flex items-end justify-center">
        <MotionDiv
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-[2px] h-24 bg-slate-800 dark:bg-white origin-bottom relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-800 dark:bg-white" />
        </MotionDiv>
      </div>

      {/* Center Hub */}
      <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-16 h-10 bg-white dark:bg-slate-900 z-10 flex items-start justify-center pt-1">
        <span className="text-xl font-extrabold" style={{ color }}>
          {clampedScore.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  isDarkMode,
  user,
  onUpdateUser,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(user?.monthlyBudget || 5000000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.locale || "id-ID", {
      style: "currency",
      currency: user?.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.locale || "id-ID", {
      style: "currency",
      currency: user?.currency || "IDR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const stats = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === TransactionType.INCOME) {
          acc.income += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.expense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);

  // Savings Rate Calculation
  const savingsRate = useMemo(() => {
    if (stats.income === 0) return 0;
    const saved = stats.income - stats.expense;
    return (saved / stats.income) * 100;
  }, [stats]);

  // Budget Calculation
  const monthlyBudget = user?.monthlyBudget || 5000000;
  const budgetProgress = Math.min((stats.expense / monthlyBudget) * 100, 100);

  // Financial Health Score (0-100)
  // 50% based on Savings Rate (ideal 20%+)
  // 50% based on Budget Adherence (expense < budget)
  const healthScore = useMemo(() => {
    let score = 0;

    // Savings Component (0-50 pts)
    // Cap savings rate bonus at 50% savings rate = 50 pts
    const savingsComponent = Math.min(Math.max(savingsRate, 0) * 2.5, 50);

    // Budget Component (0-50 pts)
    // If over budget, score drops.
    // Expense <= Budget = 50 pts.
    const budgetRatio = stats.expense / monthlyBudget;
    let budgetComponent = 0;
    if (budgetRatio <= 1) {
      budgetComponent = 50; // Perfect score if within budget
    } else {
      // Penalize for going over
      budgetComponent = Math.max(50 - (budgetRatio - 1) * 100, 0);
    }

    score = savingsComponent + budgetComponent;

    // Edge case: if no transactions, start at neutral 50
    if (transactions.length === 0) return 50;

    return score;
  }, [savingsRate, stats.expense, monthlyBudget, transactions.length]);

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((t) => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.keys(data).map((key) => ({ name: key, value: data[key] }));
  }, [transactions]);

  const incomeByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .forEach((t) => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.keys(data).map((key) => ({ name: key, value: data[key] }));
  }, [transactions]);

  // Changed to Last 30 Days
  const last30DaysData = useMemo(() => {
    const days = [];
    // 30 days history
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    return days.map((day) => {
      const dateStr = day.toISOString().split("T")[0];
      const dayLabel = day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayTransactions = transactions.filter((t) =>
        t.date.startsWith(dateStr)
      );

      return {
        name: dayLabel,
        income: dayTransactions
          .filter((t) => t.type === TransactionType.INCOME)
          .reduce((acc, t) => acc + t.amount, 0),
        expense: dayTransactions
          .filter((t) => t.type === TransactionType.EXPENSE)
          .reduce((acc, t) => acc + t.amount, 0),
      };
    });
  }, [transactions]);

  const EXPENSE_COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#ec4899",
    "#8b5cf6",
    "#64748b",
    "#f43f5e",
  ];
  const INCOME_COLORS = [
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#14b8a6",
    "#0ea5e9",
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`px-4 py-3 rounded-xl shadow-xl border ${
            isDarkMode
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-white border-slate-100 text-slate-900"
          }`}
        >
          <p className="font-bold mb-1 text-sm">{payload[0].name}</p>
          <p className="text-lg font-bold font-mono tracking-tight text-indigo-500">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const downloadCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = transactions.map((t) => [
      t.date.split("T")[0],
      t.type,
      t.category,
      t.amount,
      `"${t.description}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const jsonContent =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(transactions, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute(
      "download",
      `backup_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveBudget = () => {
    if (user) {
      onUpdateUser({ ...user, monthlyBudget: tempBudget });
      setIsEditingBudget(false);
    }
  };

  return (
    <MotionDiv
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {user?.name || "Friend"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here is your financial overview.
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors text-sm font-semibold shadow-sm border border-indigo-100 dark:border-indigo-900/50"
          >
            <FileJson size={16} />
            Backup
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors text-sm font-semibold shadow-sm"
          >
            <Download size={16} />
            CSV
          </motion.button>
        </div>
      </motion.header>

      {/* Financial Health Section (Budget & Savings) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionDiv
          variants={itemVariants}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
          }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Monthly Budget
                </p>
                {isEditingBudget ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(Number(e.target.value))}
                      className="w-32 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg"
                      autoFocus
                    />
                    <button
                      onClick={saveBudget}
                      className="text-xs bg-indigo-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 mt-1 group cursor-pointer"
                    onClick={() => setIsEditingBudget(true)}
                  >
                    <p className="text-xl font-bold text-slate-800 dark:text-white">
                      {formatCurrency(monthlyBudget)}
                    </p>
                    <Edit2
                      size={12}
                      className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Spent</p>
              <p className="font-bold text-slate-800 dark:text-white">
                {formatCompactCurrency(stats.expense)}
              </p>
            </div>
          </div>

          <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden z-10">
            <MotionDiv
              initial={{ width: 0 }}
              animate={{ width: `${budgetProgress}%` }}
              transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
              className={`absolute top-0 left-0 h-full rounded-full ${
                budgetProgress > 100
                  ? "bg-red-500"
                  : budgetProgress > 85
                  ? "bg-orange-500"
                  : "bg-indigo-500"
              }`}
            />
          </div>
          <p className="text-xs text-right mt-2 text-slate-400 z-10 relative">
            {budgetProgress > 100
              ? "Budget exceeded!"
              : `${(100 - budgetProgress).toFixed(1)}% remaining`}
          </p>
        </MotionDiv>

        <MotionDiv
          variants={itemVariants}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
          }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center text-center"
        >
          <div className="absolute top-4 left-6 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Financial Health
            </p>
          </div>

          <div className="mt-8">
            <HealthGauge score={healthScore} />
          </div>

          <p className="text-xs font-semibold text-slate-400 mt-2">
            Savings Rate:{" "}
            <span className="text-slate-600 dark:text-slate-300">
              {savingsRate.toFixed(1)}%
            </span>
          </p>
        </MotionDiv>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MotionDiv
          variants={itemVariants}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.5)",
          }}
          className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-3xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden cursor-default transition-shadow"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet
              size={80}
              className="text-white transform rotate-12 translate-x-4 -translate-y-4"
            />
          </div>
          <div className="relative z-10">
            <div className="bg-white/20 w-fit p-2 rounded-xl mb-4 backdrop-blur-sm">
              <Wallet size={24} className="text-white" />
            </div>
            <p className="text-indigo-100 text-sm font-medium mb-1">
              Total Balance
            </p>
            <h3 className="text-3xl font-bold tracking-tight">
              <AnimatedCounter
                value={stats.balance}
                formatter={formatCurrency}
              />
            </h3>
          </div>
        </MotionDiv>

        <MotionDiv
          variants={itemVariants}
          whileHover={{
            scale: 1.03,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group cursor-default transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Total Income
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                <AnimatedCounter
                  value={stats.income}
                  formatter={formatCurrency}
                />
              </h3>
            </div>
            <div className="bg-green-100 dark:bg-green-500/10 p-2 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
              <TrendingUp size={16} />
              <span>Income Stream</span>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          variants={itemVariants}
          whileHover={{
            scale: 1.03,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group cursor-default transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Total Expense
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                <AnimatedCounter
                  value={stats.expense}
                  formatter={formatCurrency}
                />
              </h3>
            </div>
            <div className="bg-red-100 dark:bg-red-500/10 p-2 rounded-xl">
              <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
              <TrendingDown size={16} />
              <span>Spending</span>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Income vs Expense Chart */}
      <MotionDiv
        variants={itemVariants}
        whileHover={{ scale: 1.005 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Income vs Expense
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last 30 days performance
            </p>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={last30DaysData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? "#334155" : "#f1f5f9"}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDarkMode ? "#94a3b8" : "#64748b",
                  fontSize: 10,
                  fontWeight: 500,
                }}
                dy={10}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDarkMode ? "#94a3b8" : "#64748b",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip
                cursor={{
                  fill: isDarkMode ? "#334155" : "#f8fafc",
                  opacity: 0.4,
                }}
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  backgroundColor: isDarkMode ? "#1e293b" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  padding: "12px 16px",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <Bar
                name="Income"
                dataKey="income"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Bar
                name="Expense"
                dataKey="expense"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MotionDiv>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <MotionDiv
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 h-[450px] flex flex-col transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
              <PieChartIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Income Breakdown
            </h3>
          </div>
          <div className="flex-1 w-full h-full min-h-0">
            {incomeByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: isDarkMode ? "#cbd5e1" : "#475569",
                      paddingTop: "20px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 flex-col gap-4 text-center p-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-full ring-8 ring-emerald-50/50 dark:ring-emerald-900/5">
                  <TrendingUp
                    className="w-8 h-8 text-emerald-400/60"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    No Income Recorded
                  </p>
                  <p className="text-xs text-slate-400 max-w-[180px]">
                    Add your salary or other earnings to see the breakdown.
                  </p>
                </div>
              </div>
            )}
          </div>
        </MotionDiv>

        {/* Expense Breakdown */}
        <MotionDiv
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 h-[450px] flex flex-col transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl">
              <PieChartIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Expense Breakdown
            </h3>
          </div>
          <div className="flex-1 w-full h-full min-h-0">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: isDarkMode ? "#cbd5e1" : "#475569",
                      paddingTop: "20px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 flex-col gap-4 text-center p-4">
                <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-full ring-8 ring-rose-50/50 dark:ring-rose-900/5">
                  <TrendingDown
                    className="w-8 h-8 text-rose-400/60"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    No Expenses Yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-[180px]">
                    Your spending habits will appear here once you track them.
                  </p>
                </div>
              </div>
            )}
          </div>
        </MotionDiv>
      </div>

      {/* Recent Activity */}
      <MotionDiv
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <Activity className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Recent Activity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your latest transactions
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="space-y-4">
            {transactions.slice(0, 6).map((t, index) => (
              <MotionDiv
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.01,
                  backgroundColor: isDarkMode
                    ? "rgba(30, 41, 59, 0.5)"
                    : "rgba(248, 250, 252, 0.8)",
                }}
                whileTap={{ scale: 0.98 }}
                key={t.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      t.type === "income"
                        ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
                        : "bg-gradient-to-br from-red-400 to-rose-600 text-white"
                    }`}
                  >
                    {t.type === "income" ? (
                      <TrendingUp size={24} />
                    ) : (
                      <TrendingDown size={24} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                      {t.category}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {t.description || t.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`block font-bold text-lg tracking-tight ${
                      t.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {t.type === "expense" ? "-" : "+"}{" "}
                    {formatCurrency(t.amount)}
                  </span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {new Date(t.date).toLocaleDateString(
                      user?.locale || "id-ID",
                      { month: "short", day: "numeric" }
                    )}
                  </span>
                </div>
              </MotionDiv>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-slate-50 dark:ring-slate-800/30">
                  <ClipboardList
                    className="w-10 h-10 text-slate-300 dark:text-slate-600"
                    strokeWidth={1.5}
                  />
                </div>
                <h4 className="text-slate-700 dark:text-slate-200 font-semibold mb-1">
                  No transactions yet
                </h4>
                <p className="text-slate-500 dark:text-slate-500 text-sm max-w-sm mx-auto">
                  Start tracking your financial journey by adding your first
                  income or expense.
                </p>
              </div>
            )}
          </div>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
};
