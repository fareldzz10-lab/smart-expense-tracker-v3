
import Dexie, { Table } from 'dexie';
import { Transaction, RecurringTransaction, SavingsGoal, Budget } from './types';

// Define the database type explicitly
export type ExpenseTrackerDB = Dexie & {
  transactions: Table<Transaction>;
  recurring: Table<RecurringTransaction>;
  savings: Table<SavingsGoal>;
  budgets: Table<Budget>;
  settings: Table<{ key: string; value: any }>;
};

// Initialize the database instance
const db = new Dexie('SmartExpenseTrackerDB') as ExpenseTrackerDB;

// Define table schemas
// 'id' is the primary key for transactions
// 'key' is the primary key for settings (used for user profile, theme, etc.)
db.version(1).stores({
  transactions: 'id, date, type, category', 
  settings: 'key'
});

// Version 2 adds recurring transactions support
db.version(2).stores({
  transactions: 'id, date, type, category', 
  recurring: 'id, nextDueDate, type',
  settings: 'key'
});

// Version 3 adds savings goals
db.version(3).stores({
  transactions: 'id, date, type, category', 
  recurring: 'id, nextDueDate, type',
  savings: 'id',
  settings: 'key'
});

// Version 4 adds budgets
db.version(4).stores({
  transactions: 'id, date, type, category', 
  recurring: 'id, nextDueDate, type',
  savings: 'id',
  budgets: 'id',
  settings: 'key'
});

export { db };
