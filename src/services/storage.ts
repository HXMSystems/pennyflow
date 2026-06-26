import type { AppState, UserProfile, Envelope, Paycheck, Transaction, Debt, Bill } from '../types';

const STORAGE_KEY = 'pennyflow_state';
const CURRENT_VERSION = 1;

const INITIAL_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Penny Budgeter',
  email: 'penny@example.com',
  currency: 'USD',
  isPremium: false,
  createdAt: new Date().toISOString(),
};

const SEED_ENVELOPES: Envelope[] = [
  {
    id: 'env-1',
    name: 'Rent',
    category: 'housing',
    color: '#3B82F6',
    allocatedAmount: 1200,
    currentBalance: 0,
    isSinkingFund: false,
    icon: 'Home',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'env-2',
    name: 'Groceries',
    category: 'food',
    color: '#10B981',
    allocatedAmount: 400,
    currentBalance: 156.32,
    isSinkingFund: false,
    icon: 'ShoppingBag',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'env-3',
    name: 'Transportation',
    category: 'transportation',
    color: '#8B5CF6',
    allocatedAmount: 200,
    currentBalance: 85.00,
    isSinkingFund: false,
    icon: 'Car',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'env-4',
    name: 'Utilities',
    category: 'utilities',
    color: '#F59E0B',
    allocatedAmount: 250,
    currentBalance: 0,
    isSinkingFund: false,
    icon: 'Zap',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'env-5',
    name: 'Vacation Fund',
    category: 'savings',
    color: '#EC4899',
    allocatedAmount: 0,
    currentBalance: 450.00,
    isSinkingFund: true,
    targetAmount: 1500,
    targetDate: '2026-12-01',
    icon: 'Plane',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'env-6',
    name: 'Emergency Fund',
    category: 'savings',
    color: '#EF4444',
    allocatedAmount: 0,
    currentBalance: 2000.00,
    isSinkingFund: true,
    targetAmount: 5000,
    targetDate: '2027-06-01',
    icon: 'Shield',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'env-7',
    name: 'Entertainment',
    category: 'entertainment',
    color: '#14B8A6',
    allocatedAmount: 100,
    currentBalance: 45.50,
    isSinkingFund: false,
    icon: 'Music',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

const SEED_PAYCHECKS: Paycheck[] = [
  {
    id: 'pc-1',
    source: 'Bi-Weekly Salary',
    amount: 2500,
    date: '2026-06-19T00:00:00.000Z',
    isAllocated: false,
    allocations: [
      { envelopeId: 'env-1', amount: 1200 },
      { envelopeId: 'env-2', amount: 400 },
      { envelopeId: 'env-3', amount: 200 },
      { envelopeId: 'env-4', amount: 250 },
      { envelopeId: 'env-7', amount: 100 },
    ],
  },
  {
    id: 'pc-2',
    source: 'Freelance Project',
    amount: 800,
    date: '2026-06-05T00:00:00.000Z',
    isAllocated: true,
    allocations: [
      { envelopeId: 'env-5', amount: 300 },
      { envelopeId: 'env-6', amount: 500 },
    ],
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-06-18T14:30:00.000Z',
    description: 'Weekly grocery run at Trader Joe\'s',
    amount: -87.43,
    type: 'expense',
    envelopeId: 'env-2',
    isRecurringBill: false,
  },
  {
    id: 'tx-2',
    date: '2026-06-17T08:15:00.000Z',
    description: 'Gas station - Shell',
    amount: -45.00,
    type: 'expense',
    envelopeId: 'env-3',
    isRecurringBill: false,
  },
  {
    id: 'tx-3',
    date: '2026-06-15T19:00:00.000Z',
    description: 'Movie tickets + popcorn',
    amount: -32.50,
    type: 'expense',
    envelopeId: 'env-7',
    isRecurringBill: false,
  },
  {
    id: 'tx-4',
    date: '2026-06-14T11:00:00.000Z',
    description: 'Farmers market produce',
    amount: -22.00,
    type: 'expense',
    envelopeId: 'env-2',
    isRecurringBill: false,
  },
  {
    id: 'tx-5',
    date: '2026-06-12T09:30:00.000Z',
    description: 'Monthly electric bill payment',
    amount: -95.00,
    type: 'expense',
    envelopeId: 'env-4',
    isRecurringBill: false,
  },
  {
    id: 'tx-6',
    date: '2026-06-05T16:00:00.000Z',
    description: 'Freelance project payment received',
    amount: 800.00,
    type: 'income',
    isRecurringBill: false,
  },
];

const SEED_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    name: 'Chase Credit Card',
    balance: 4500,
    interestRate: 0.1899,
    minimumPayment: 135,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'debt-2',
    name: 'Student Loan',
    balance: 12000,
    interestRate: 0.0425,
    minimumPayment: 180,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

const SEED_BILLS: Bill[] = [
  {
    id: 'bill-1',
    name: 'Netflix',
    amount: 15.99,
    dueDate: '2026-07-15',
    frequency: 'monthly',
    category: 'Entertainment',
    isPaid: false,
    paidHistory: [],
  },
  {
    id: 'bill-2',
    name: 'Rent',
    amount: 1200,
    dueDate: '2026-07-01',
    frequency: 'monthly',
    category: 'Housing',
    envelopeId: 'env-1',
    isPaid: false,
    paidHistory: [],
  },
  {
    id: 'bill-3',
    name: 'Electric Bill',
    amount: 95,
    dueDate: '2026-06-25',
    frequency: 'monthly',
    category: 'Utilities',
    envelopeId: 'env-4',
    isPaid: false,
    paidHistory: [],
  },
];

const INITIAL_STATE: AppState = {
  profile: INITIAL_PROFILE,
  envelopes: SEED_ENVELOPES,
  paychecks: SEED_PAYCHECKS,
  transactions: SEED_TRANSACTIONS,
  debts: SEED_DEBTS,
  bills: SEED_BILLS,
  version: CURRENT_VERSION,
};

export class StorageService {
  public static getAppState(): AppState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveAppState(INITIAL_STATE);
      return INITIAL_STATE;
    }
    try {
      const state = JSON.parse(raw) as AppState;
      if (state.version < CURRENT_VERSION) {
        return this.migrate(state);
      }
      return state;
    } catch {
      console.error('Failed to parse AppState from localStorage, resetting to seed data');
      this.saveAppState(INITIAL_STATE);
      return INITIAL_STATE;
    }
  }

  public static saveAppState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private static migrate(oldState: AppState): AppState {
    return { ...oldState, version: CURRENT_VERSION };
  }

  public static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}