import { TransactionType } from './types';

export const CATEGORIES = {
  [TransactionType.EXPENSE]: [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Personal Care',
    'Education',
    'Travel',
    'Other'
  ],
  [TransactionType.INCOME]: [
    'Salary',
    'Freelance',
    'Investments',
    'Gifts',
    'Refunds',
    'Other'
  ]
};
