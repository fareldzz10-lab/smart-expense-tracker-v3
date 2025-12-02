
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
  linkedGoalId?: string;
  attachment?: string; // Base64 encoded image string
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  active: boolean;
  linkedGoalId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO String YYYY-MM-DD
  color: string;
  icon?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly';
}

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface User {
  name: string;
  email: string;
  monthlyBudget?: number;
  currency?: string;
  locale?: string;
}
