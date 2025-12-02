import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  Transaction,
  User,
  RecurringTransaction,
  SavingsGoal,
  Budget,
} from "../types";
import { generateUUID } from "../utils";

// Helper to get current user ID
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return user.uid;
};

// --- Transactions ---

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const uid = getUserId();
    const q = query(
      collection(db, "users", uid, "transactions"),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Transaction);
  } catch (e) {
    console.error("Error getting transactions:", e);
    return [];
  }
};

export const addTransaction = async (transaction: Transaction) => {
  const uid = getUserId();
  const txRef = doc(db, "users", uid, "transactions", transaction.id);

  try {
    if (transaction.linkedGoalId) {
      // Use a transaction to update both the record and the savings goal safely
      await runTransaction(db, async (fbTx) => {
        const goalRef = doc(
          db,
          "users",
          uid,
          "savings",
          transaction.linkedGoalId!
        );
        const goalDoc = await fbTx.get(goalRef);

        if (goalDoc.exists()) {
          const goal = goalDoc.data() as SavingsGoal;
          const newAmount = goal.currentAmount + transaction.amount;
          fbTx.update(goalRef, { currentAmount: newAmount });
        }
        fbTx.set(txRef, transaction);
      });
    } else {
      await setDoc(txRef, transaction);
    }
  } catch (e) {
    console.error("Error adding transaction:", e);
    throw e;
  }
};

export const updateTransaction = async (transaction: Transaction) => {
  const uid = getUserId();
  const txRef = doc(db, "users", uid, "transactions", transaction.id);

  try {
    await runTransaction(db, async (fbTx) => {
      const oldTxDoc = await fbTx.get(txRef);
      if (!oldTxDoc.exists()) throw new Error("Transaction does not exist");
      const oldTransaction = oldTxDoc.data() as Transaction;

      // Revert old goal effect
      if (oldTransaction.linkedGoalId) {
        const oldGoalRef = doc(
          db,
          "users",
          uid,
          "savings",
          oldTransaction.linkedGoalId
        );
        const oldGoalDoc = await fbTx.get(oldGoalRef);
        if (oldGoalDoc.exists()) {
          const oldGoal = oldGoalDoc.data() as SavingsGoal;
          fbTx.update(oldGoalRef, {
            currentAmount: oldGoal.currentAmount - oldTransaction.amount,
          });
        }
      }

      // Apply new goal effect
      if (transaction.linkedGoalId) {
        const newGoalRef = doc(
          db,
          "users",
          uid,
          "savings",
          transaction.linkedGoalId
        );
        const newGoalDoc = await fbTx.get(newGoalRef);
        if (newGoalDoc.exists()) {
          const newGoal = newGoalDoc.data() as SavingsGoal;
          fbTx.update(newGoalRef, {
            currentAmount: newGoal.currentAmount + transaction.amount,
          });
        }
      }

      fbTx.set(txRef, transaction);
    });
  } catch (e) {
    console.error("Error updating transaction:", e);
    throw e;
  }
};

export const deleteTransaction = async (id: string) => {
  const uid = getUserId();
  const txRef = doc(db, "users", uid, "transactions", id);

  try {
    await runTransaction(db, async (fbTx) => {
      const txDoc = await fbTx.get(txRef);
      if (!txDoc.exists()) return;
      const transaction = txDoc.data() as Transaction;

      if (transaction.linkedGoalId) {
        const goalRef = doc(
          db,
          "users",
          uid,
          "savings",
          transaction.linkedGoalId
        );
        const goalDoc = await fbTx.get(goalRef);
        if (goalDoc.exists()) {
          const goal = goalDoc.data() as SavingsGoal;
          fbTx.update(goalRef, {
            currentAmount: goal.currentAmount - transaction.amount,
          });
        }
      }

      fbTx.delete(txRef);
    });
  } catch (e) {
    console.error("Error deleting transaction:", e);
    throw e;
  }
};

export const bulkDeleteTransactions = async (ids: string[]) => {
  const uid = getUserId();
  const batch = writeBatch(db);

  // Note: For simplicity, this bulk delete does NOT update savings goals automatically
  // due to complexity of reading multiple docs in a batch.
  // In a robust app, you'd iterate and use runTransaction or update individually.
  ids.forEach((id) => {
    const ref = doc(db, "users", uid, "transactions", id);
    batch.delete(ref);
  });

  await batch.commit();
};

export const clearTransactions = async () => {
  // Firestore doesn't support deleting collections easily from client.
  // We will just fetch keys and batch delete (up to 500 limit usually, but simplified here)
  const uid = getUserId();
  const collections = ["transactions", "recurring", "savings", "budgets"];

  for (const colName of collections) {
    const q = query(collection(db, "users", uid, colName));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
};

export const importTransactions = async (newTransactions: Transaction[]) => {
  const uid = getUserId();
  const batch = writeBatch(db);

  newTransactions.forEach((t) => {
    if (t.id && t.date && t.amount) {
      const ref = doc(db, "users", uid, "transactions", t.id);
      batch.set(ref, t);
    }
  });

  await batch.commit();
};

// --- Recurring Transactions ---

export const getRecurringTransactions = async (): Promise<
  RecurringTransaction[]
> => {
  const uid = getUserId();
  const snapshot = await getDocs(collection(db, "users", uid, "recurring"));
  return snapshot.docs.map((doc) => doc.data() as RecurringTransaction);
};

export const addRecurringTransaction = async (
  recurring: RecurringTransaction
) => {
  const uid = getUserId();
  await setDoc(doc(db, "users", uid, "recurring", recurring.id), recurring);
};

export const deleteRecurringTransaction = async (id: string) => {
  const uid = getUserId();
  await deleteDoc(doc(db, "users", uid, "recurring", id));
};

export const updateRecurringTransaction = async (
  recurring: RecurringTransaction
) => {
  const uid = getUserId();
  await setDoc(doc(db, "users", uid, "recurring", recurring.id), recurring);
};

// --- Savings Goals ---

export const getSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const uid = getUserId();
  const snapshot = await getDocs(collection(db, "users", uid, "savings"));
  return snapshot.docs.map((doc) => doc.data() as SavingsGoal);
};

export const addSavingsGoal = async (goal: SavingsGoal) => {
  const uid = getUserId();
  await setDoc(doc(db, "users", uid, "savings", goal.id), goal);
};

export const updateSavingsGoal = async (goal: SavingsGoal) => {
  const uid = getUserId();
  await setDoc(doc(db, "users", uid, "savings", goal.id), goal);
};

export const deleteSavingsGoal = async (id: string) => {
  const uid = getUserId();
  await deleteDoc(doc(db, "users", uid, "savings", id));
};

// --- Budgets ---

export const getBudgets = async (): Promise<Budget[]> => {
  const uid = getUserId();
  const snapshot = await getDocs(collection(db, "users", uid, "budgets"));
  return snapshot.docs.map((doc) => doc.data() as Budget);
};

export const addBudget = async (budget: Budget) => {
  const uid = getUserId();
  await setDoc(doc(db, "users", uid, "budgets", budget.id), budget);
};

export const updateBudget = async (budget: Budget) => {
  const uid = getUserId();
  await setDoc(doc(db, "users", uid, "budgets", budget.id), budget);
};

export const deleteBudget = async (id: string) => {
  const uid = getUserId();
  await deleteDoc(doc(db, "users", uid, "budgets", id));
};

// --- Automation Logic ---
export const processRecurringTransactions = async (): Promise<number> => {
  if (!auth.currentUser) return 0;
  const uid = auth.currentUser.uid;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurringRef = collection(db, "users", uid, "recurring");
  const q = query(recurringRef, where("active", "==", true));
  const snapshot = await getDocs(q);

  let processedCount = 0;
  const batch = writeBatch(db);
  let hasUpdates = false;

  for (const docSnap of snapshot.docs) {
    const rule = docSnap.data() as RecurringTransaction;
    let nextDue = new Date(rule.nextDueDate);
    let modified = false;

    while (nextDue <= today) {
      const newTx: Transaction = {
        id: generateUUID(),
        date: nextDue.toISOString(),
        amount: rule.amount,
        category: rule.category,
        description: `(Auto) ${rule.description}`,
        type: rule.type,
        linkedGoalId: rule.linkedGoalId,
      };

      const newTxRef = doc(db, "users", uid, "transactions", newTx.id);
      batch.set(newTxRef, newTx);
      processedCount++;
      modified = true;
      hasUpdates = true;

      // Note: Updating linked savings goals in a batch is complex because we need the current value.
      // For simplicity in this bulk operation, we skip atomic goal updates here
      // or you would need to read all goals first.

      // Advance date
      switch (rule.frequency) {
        case "daily":
          nextDue.setDate(nextDue.getDate() + 1);
          break;
        case "weekly":
          nextDue.setDate(nextDue.getDate() + 7);
          break;
        case "monthly":
          nextDue.setMonth(nextDue.getMonth() + 1);
          break;
        case "yearly":
          nextDue.setFullYear(nextDue.getFullYear() + 1);
          break;
      }
    }

    if (modified) {
      batch.update(docSnap.ref, { nextDueDate: nextDue.toISOString() });
    }
  }

  if (hasUpdates) {
    await batch.commit();
  }

  return processedCount;
};

// --- Currency Conversion ---
export const convertAllAmounts = async (rate: number) => {
  // This is expensive in Firestore (Read all -> Write all).
  // Implementing purely for feature parity but use with caution on large datasets.
  const uid = getUserId();
  const batch = writeBatch(db);

  // Helper to process a collection
  const processCollection = async (colName: string, amountKey: string) => {
    const snapshot = await getDocs(collection(db, "users", uid, colName));
    snapshot.docs.forEach((d) => {
      const data = d.data() as Record<string, any>;
      batch.update(d.ref, { [amountKey]: Math.round(data[amountKey] * rate) });
    });
  };

  await processCollection("transactions", "amount");
  await processCollection("recurring", "amount");

  // Savings needs target and current
  const savingsSnap = await getDocs(collection(db, "users", uid, "savings"));
  savingsSnap.docs.forEach((d) => {
    const data = d.data() as SavingsGoal;
    batch.update(d.ref, {
      targetAmount: Math.round(data.targetAmount * rate),
      currentAmount: Math.round(data.currentAmount * rate),
    });
  });

  await processCollection("budgets", "limit");

  // User budget
  const settingsRef = doc(db, "users", uid, "settings", "profile");
  const settingsSnap = await getDoc(settingsRef);
  if (settingsSnap.exists()) {
    const userData = settingsSnap.data() as User;
    if (userData.monthlyBudget) {
      batch.update(settingsRef, {
        monthlyBudget: Math.round(userData.monthlyBudget * rate),
      });
    }
  }

  await batch.commit();
};

// --- User & Settings ---

export const getUser = async (): Promise<User | null> => {
  if (!auth.currentUser) return null;
  const uid = auth.currentUser.uid;
  const docRef = doc(db, "users", uid, "settings", "profile");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as User) : null;
};

export const saveUser = async (user: User) => {
  const uid = getUserId();
  await setDoc(doc(db, "users", uid, "settings", "profile"), user);
};

export const removeUser = async () => {
  // In firebase we usually just signOut, data remains in cloud.
  await auth.signOut();
};

export const getTheme = async (): Promise<string | null> => {
  if (!auth.currentUser) return null;
  const uid = auth.currentUser.uid;
  const docRef = doc(db, "users", uid, "settings", "theme");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as { value: string }).value : null;
};

export const saveTheme = async (theme: "light" | "dark") => {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  await setDoc(doc(db, "users", uid, "settings", "theme"), { value: theme });
};
