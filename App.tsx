import React, { useState, useEffect } from "react";
import { Layout } from "./components/ui/Layout";
import { Dashboard } from "./components/Dashboard";
import { TransactionList } from "./components/TransactionList";
import { AIAdvisor } from "./components/AIAdvisor";
import { TransactionForm } from "./components/TransactionForm";
import { RecurringList } from "./components/RecurringList";
import { SavingsList } from "./components/SavingsList";
import { BudgetList } from "./components/BudgetList";
import { Login } from "./components/Login";
import { ToastContainer, ToastMessage, ToastType } from "./components/ui/Toast";
import {
  Transaction,
  User,
  RecurringTransaction,
  SavingsGoal,
  TransactionType,
  Budget,
} from "./types";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  clearTransactions,
  getUser,
  saveUser,
  removeUser,
  getTheme,
  saveTheme,
  getRecurringTransactions,
  processRecurringTransactions,
  getSavingsGoals,
  bulkDeleteTransactions,
  getBudgets,
} from "./services/storageService";
import { AnimatePresence, motion } from "framer-motion";
import { generateUUID } from "./utils";
import { auth } from "./services/firebase";

// Cast motion.div to any to avoid strict type issues with framer-motion versions
const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringTransaction[]>(
    []
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaultType, setFormDefaultType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Initialize App & Listen to Auth
  useEffect(() => {
    // Namespaced Auth listener
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);

        // Try fetch user profile from DB
        let storedUser = await getUser();
        const googleName = firebaseUser.displayName;
        const googleEmail = firebaseUser.email || "";

        // If user doesn't exist in DB, create them
        if (!storedUser) {
          storedUser = {
            name: googleName || "Friend",
            email: googleEmail,
          };
          await saveUser(storedUser);
        }
        // If user exists but has a generic name ('User') and we have a better name from Google, update it
        else if (
          (storedUser.name === "User" || !storedUser.name) &&
          googleName
        ) {
          storedUser.name = googleName;
          await saveUser(storedUser);
        }

        setUser(storedUser);

        // Load Theme
        const storedTheme = await getTheme();
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (storedTheme === "dark" || (!storedTheme && systemPrefersDark)) {
          setDarkMode(true);
          document.documentElement.classList.add("dark");
        } else {
          setDarkMode(false);
          document.documentElement.classList.remove("dark");
        }

        // Load Data
        await refreshData();

        // Process Automation
        const processedCount = await processRecurringTransactions();
        if (processedCount > 0) {
          showToast(
            `${processedCount} recurring transactions processed.`,
            "success"
          );
        }

        setIsDataLoaded(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsDataLoaded(true);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const refreshData = async () => {
    // Parallel data fetching for better performance
    const [txData, recData, savingsData, budgetData] = await Promise.all([
      getTransactions(),
      getRecurringTransactions(),
      getSavingsGoals(),
      getBudgets(),
    ]);

    setTransactions(txData);
    setRecurringRules(recData);
    setSavingsGoals(savingsData);
    setBudgets(budgetData);
  };

  // Toast Handler
  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Update Theme
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      const themeVal = newMode ? "dark" : "light";

      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      saveTheme(themeVal); // Save to DB
      return newMode;
    });
  };

  // Login is handled by the component via Firebase Auth, this callback updates local state if needed
  const handleLogin = (loggedInUser: User) => {
    // State updates happen in onAuthStateChanged
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await removeUser(); // This calls auth.signOut()
      setIsAuthenticated(false);
      setUser(null);
      setActiveTab("dashboard");
      showToast("You have been signed out.", "info");
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    await saveUser(updatedUser); // Update in DB
    showToast("Profile updated successfully", "success");
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTx,
      id: generateUUID(),
    };

    // Update UI immediately (optimistic)
    setTransactions((prev) => [transaction, ...prev]);

    // Persist to DB
    try {
      await addTransaction(transaction);
      showToast("Transaction added successfully!", "success");
      refreshData(); // Refresh to update savings goals if linked
    } catch (e) {
      showToast("Failed to save transaction", "error");
      refreshData(); // Revert optimistic update
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    // Update UI immediately
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );

    // Persist to DB
    try {
      await updateTransaction(updatedTx);
      showToast("Transaction updated successfully!", "success");
      refreshData(); // Refresh to update savings goals if linked
    } catch (e) {
      showToast("Failed to update transaction", "error");
      refreshData(); // Revert optimistic update
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      // Update UI immediately
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      // Persist to DB
      try {
        await deleteTransaction(id);
        showToast("Transaction deleted.", "info");
        refreshData(); // Refresh to update savings goals if linked
      } catch (e) {
        showToast("Failed to delete transaction", "error");
        refreshData(); // Revert optimistic update
      }
    }
  };

  const handleBulkDeleteTransaction = async (ids: string[]) => {
    if (ids.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${ids.length} transactions?`
      )
    ) {
      // Update UI
      setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));

      try {
        await bulkDeleteTransactions(ids);
        showToast(`${ids.length} transactions deleted.`, "info");
        refreshData();
      } catch (e) {
        showToast("Failed to delete transactions", "error");
        refreshData();
      }
    }
  };

  const handleEditRequest = (t: Transaction) => {
    setEditingTransaction(t);
    setFormDefaultType(t.type);
    setIsFormOpen(true);
  };

  const handleOpenAdd = (type: TransactionType = TransactionType.EXPENSE) => {
    setEditingTransaction(null);
    setFormDefaultType(type);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingTransaction(null);
    }, 300);
  };

  const handleClearData = async () => {
    if (
      window.confirm(
        "WARNING: This will delete ALL transactions permanently. Are you sure?"
      )
    ) {
      // Optimistic clear
      setTransactions([]);
      setRecurringRules([]);
      setSavingsGoals([]);
      setBudgets([]);

      try {
        await clearTransactions();
        showToast("Transaction history reset.", "info");
        refreshData();
      } catch (e) {
        showToast("Failed to reset data", "error");
        refreshData();
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            transactions={transactions}
            isDarkMode={darkMode}
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        );
      case "transactions":
        return (
          <TransactionList
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            onBulkDelete={handleBulkDeleteTransaction}
            onEdit={handleEditRequest}
            onClearData={handleClearData}
            user={user}
            onUpdateUser={handleUpdateUser}
            onAddClick={handleOpenAdd}
            savingsGoals={savingsGoals}
          />
        );
      case "budgets":
        return (
          <BudgetList
            budgets={budgets}
            transactions={transactions}
            onRefresh={refreshData}
            user={user}
          />
        );
      case "recurring":
        return (
          <RecurringList
            recurringRules={recurringRules}
            onRefresh={refreshData}
            user={user}
            savingsGoals={savingsGoals}
          />
        );
      case "savings":
        return (
          <SavingsList
            savingsGoals={savingsGoals}
            onRefresh={refreshData}
            user={user}
          />
        );
      case "advisor":
        return <AIAdvisor transactions={transactions} showToast={showToast} />;
      default:
        return (
          <Dashboard
            transactions={transactions}
            isDarkMode={darkMode}
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        );
    }
  };

  // Loading Screen
  if (!authChecked || (isAuthenticated && !isDataLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              if (!darkMode) document.documentElement.classList.add("dark");
              else document.documentElement.classList.remove("dark");
            }}
            className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-md text-slate-600 dark:text-slate-300"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
        <Login onLogin={handleLogin} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onAddClick={() => handleOpenAdd(TransactionType.EXPENSE)}
      isDarkMode={darkMode}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
      user={user}
    >
      <AnimatePresence mode="wait">
        <MotionDiv
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </MotionDiv>
      </AnimatePresence>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleAddTransaction}
        onUpdate={handleUpdateTransaction}
        initialData={editingTransaction}
        prefillData={null}
        currency={user?.currency || "IDR"}
        locale={user?.locale || "id-ID"}
        defaultType={formDefaultType}
        savingsGoals={savingsGoals}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </Layout>
  );
};

export default App;
