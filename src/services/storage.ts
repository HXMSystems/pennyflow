import type { AppState, UserProfile, Envelope, Paycheck, Debt, Bill } from '../types';

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
    color: 'blue-500',
    allocatedAmount: 1200,
    currentBalance: 0,
    isSinkingFund: false,
    icon: 'Home',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'env-2',
    name: 'Groceries',
    category: 'food',
    color: 'emerald-500',
    allocatedAmount: 400,
    currentBalance: 120,
    isSinkingFund: false,
    icon: 'ShoppingBag',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'env-3',
    name: 'Vacation',
    category: 'savings',
    color: 'amber-500',
    allocatedAmount: 100,
    currentBalance: 400,
    isSinkingFund: true,
    targetAmount: 1000,
    targetDate: '2026-12-01',
    icon: 'Plane',
    createdAt: new Date().toISOString(),
  },
];

const SEED_PAYCHECKS: Paycheck[] = [
  {
    id: 'pc-1',
    source: 'Bi-Weekly Salary',
    amount: 2500,
    date: new Date().toISOString(),
    isAllocated: false,
    allocations: [],
  },
];

const SEED_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    name: 'Chase Credit Card',
    balance: 5000,
    interestRate: 0.1899,
    minimumPayment: 150,
    createdAt: new Date().toISOString(),
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
];

const INITIAL_STATE: AppState = {
  profile: INITIAL_PROFILE,
  envelopes: SEED_ENVELOPES,
  paychecks: SEED_PAYCHECKS,
  transactions: [],
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
      // Handle version migration if needed
      if (state.version < CURRENT_VERSION) {
        return this.migrate(state);
      }
      return state;
    } catch (e) {
      console.error('Failed to parse AppState from localStorage', e);
      return INITIAL_STATE;
    }
  }

  public static saveAppState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private static migrate(oldState: AppState): AppState {
    // Migration logic would go here
    return { ...oldState, version: CURRENT_VERSION };
  }

  public static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
