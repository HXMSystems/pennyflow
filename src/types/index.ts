/**
 * User Profile & Subscription State
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string; // e.g. "USD", "EUR", "GBP"
  isPremium: boolean; // Controls feature gates: unlimited envelopes, snowball/avalanche calculators, etc.
  createdAt: string; // ISO DateTime
}

/**
 * Cash Envelope or Sinking Fund Category
 */
export interface Envelope {
  id: string;
  name: string;
  category: 'housing' | 'food' | 'transportation' | 'utilities' | 'debt' | 'savings' | 'entertainment' | 'other';
  color: string; // Hex code or specific Tailwind color class (e.g., 'emerald-500', '#10B981')
  allocatedAmount: number; // Planned budget allocation from active paycheck
  currentBalance: number; // Current actual cash level
  isSinkingFund: boolean; // true = Sinking Fund (savings goal over time), false = Standard cash envelope
  targetAmount?: number; // Sinking fund savings goal (required if isSinkingFund is true)
  targetDate?: string; // Sinking fund goal completion date (ISO Date, required if isSinkingFund is true)
  icon: string; // Lucide icon identifier (e.g., "Home", "ShoppingBag", "Car")
  createdAt: string;
}

/**
 * Paycheck Ledger for zero-based income allocation
 */
export interface Paycheck {
  id: string;
  source: string; // e.g., "Bi-Weekly Salary", "Freelance Invoice"
  amount: number; // Net cash amount received
  date: string; // ISO Date of deposit
  isAllocated: boolean; // Has this paycheck been fully budgeted to envelopes?
  allocations: PaycheckAllocation[];
}

export interface PaycheckAllocation {
  envelopeId: string;
  amount: number; // Amount assigned to this envelope from this paycheck
}

/**
 * Transaction Log
 */
export interface Transaction {
  id: string;
  date: string; // ISO Date of transaction
  description: string;
  amount: number; // Positive for income, negative for expenses/outflow
  type: 'income' | 'expense';
  envelopeId?: string; // Associated envelope ID (optional for general transactions, mandatory for envelope expenses)
  isRecurringBill: boolean; // Flag if this transaction was spawned by a scheduled bill payment
  billId?: string; // Reference to the scheduled bill if applicable
}

/**
 * Debt Profile for Snowball/Avalanche Trackers
 */
export interface Debt {
  id: string;
  name: string; // e.g., "Chase Credit Card", "Auto Loan", "Student Loan"
  balance: number; // Current principal outstanding
  interestRate: number; // Annual interest rate as decimal (e.g., 0.1899 for 18.99%)
  minimumPayment: number; // Minimum monthly payment required
  createdAt: string;
}

/**
 * Scheduled Bill Payment Tracker
 */
export interface Bill {
  id: string;
  name: string; // e.g., "Netflix Subscription", "Rent Payment", "Electric Bill"
  amount: number;
  dueDate: string; // Next due date (ISO Date)
  frequency: 'once' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  category: string;
  envelopeId?: string; // Auto-deduct from this envelope when marked paid
  isPaid: boolean; // Is current billing cycle paid?
  paidHistory: {
    billingCycleDueDate: string; // ISO Date representing the due date of cycle
    paymentDate: string; // ISO Date of payment execution
    transactionId: string; // Link to spawned transaction
  }[];
}

/**
 * Entire Application State Tree
 */
export interface AppState {
  profile: UserProfile;
  envelopes: Envelope[];
  paychecks: Paycheck[];
  transactions: Transaction[];
  debts: Debt[];
  bills: Bill[];
  version: number;
}
