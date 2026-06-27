import { create } from 'zustand';
import type { AppState, UserProfile, Envelope, Paycheck, Transaction, Debt, Bill, PaycheckAllocation } from '../types';
import { StorageService } from '../services/storage';

interface StoreState extends AppState {
  // Profile
  setProfile: (profile: UserProfile) => void;

  // Envelopes
  addEnvelope: (envelope: Envelope) => void;
  updateEnvelope: (id: string, updates: Partial<Envelope>) => void;
  deleteEnvelope: (id: string) => void;

  // Paychecks
  addPaycheck: (paycheck: Paycheck) => void;
  updatePaycheck: (id: string, updates: Partial<Paycheck>) => void;
  setPaycheckAllocation: (paycheckId: string, envelopeId: string, amount: number) => void;
  removePaycheckAllocation: (paycheckId: string, envelopeId: string) => void;
  confirmPaycheckAllocation: (paycheckId: string) => void;

  // Transactions
  addTransaction: (transaction: Transaction) => void;

  // Debts
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  // Bills
  addBill: (bill: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  markBillPaid: (billId: string) => void;

  // Persistence
  save: () => void;
}

export const useStore = create<StoreState>((set, get) => {
  const initialState = StorageService.getAppState();

  return {
    ...initialState,

    setProfile: (profile) => {
      set({ profile });
    },

    addEnvelope: (envelope) => {
      set((state) => ({ envelopes: [...state.envelopes, envelope] }));
    },

    updateEnvelope: (id, updates) => {
      set((state) => ({
        envelopes: state.envelopes.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      }));
    },

    deleteEnvelope: (id) => {
      set((state) => ({
        envelopes: state.envelopes.filter((e) => e.id !== id),
      }));
    },

    addPaycheck: (paycheck) => {
      set((state) => ({ paychecks: [...state.paychecks, paycheck] }));
    },

    updatePaycheck: (id, updates) => {
      set((state) => ({
        paychecks: state.paychecks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
    },

    setPaycheckAllocation: (paycheckId, envelopeId, amount) => {
      set((state) => ({
        paychecks: state.paychecks.map((p) => {
          if (p.id !== paycheckId) return p;
          const existingIdx = p.allocations.findIndex((a) => a.envelopeId === envelopeId);
          let newAllocations: PaycheckAllocation[];
          if (existingIdx >= 0) {
            newAllocations = p.allocations.map((a, i) =>
              i === existingIdx ? { ...a, amount } : a
            );
          } else {
            newAllocations = [...p.allocations, { envelopeId, amount }];
          }
          return { ...p, allocations: newAllocations };
        }),
      }));
    },

    removePaycheckAllocation: (paycheckId, envelopeId) => {
      set((state) => ({
        paychecks: state.paychecks.map((p) =>
          p.id === paycheckId
            ? { ...p, allocations: p.allocations.filter((a) => a.envelopeId !== envelopeId) }
            : p
        ),
      }));
    },

    confirmPaycheckAllocation: (paycheckId) => {
      set((state) => {
        const paycheck = state.paychecks.find((p) => p.id === paycheckId);
        if (!paycheck) return state;

        // Add allocations to envelope balances
        let updatedEnvelopes = [...state.envelopes];
        for (const allocation of paycheck.allocations) {
          const idx = updatedEnvelopes.findIndex((e) => e.id === allocation.envelopeId);
          if (idx >= 0) {
            updatedEnvelopes[idx] = {
              ...updatedEnvelopes[idx],
              allocatedAmount: (updatedEnvelopes[idx].allocatedAmount || 0) + allocation.amount,
              currentBalance: updatedEnvelopes[idx].currentBalance + allocation.amount,
            };
          }
        }

        // Mark paycheck as allocated
        const updatedPaychecks = state.paychecks.map((p) =>
          p.id === paycheckId
            ? { ...p, isAllocated: true }
            : p
        );

        // Create a transaction for the paycheck income
        const incomeTx: Transaction = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Paycheck: ${paycheck.source}`,
          amount: paycheck.amount,
          type: 'income',
          isRecurringBill: false,
        };

        return {
          envelopes: updatedEnvelopes,
          paychecks: updatedPaychecks,
          transactions: [incomeTx, ...state.transactions],
        };
      });
    },

    addTransaction: (transaction) => {
      set((state) => {
        // If it's an expense tied to an envelope, deduct from balance
        let updatedEnvelopes = state.envelopes;
        if (transaction.type === 'expense' && transaction.envelopeId) {
          updatedEnvelopes = state.envelopes.map((e) => {
            if (e.id === transaction.envelopeId) {
              return { ...e, currentBalance: e.currentBalance + transaction.amount };
            }
            return e;
          });
        }
        // If it's income tied to an envelope, add to balance
        if (transaction.type === 'income' && transaction.envelopeId) {
          updatedEnvelopes = state.envelopes.map((e) => {
            if (e.id === transaction.envelopeId) {
              return { ...e, currentBalance: e.currentBalance + transaction.amount };
            }
            return e;
          });
        }
        return {
          envelopes: updatedEnvelopes,
          transactions: [transaction, ...state.transactions],
        };
      });
    },

    addDebt: (debt) => {
      set((state) => ({ debts: [...state.debts, debt] }));
    },

    updateDebt: (id, updates) => {
      set((state) => ({
        debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      }));
    },

    deleteDebt: (id) => {
      set((state) => ({
        debts: state.debts.filter((d) => d.id !== id),
      }));
    },

    addBill: (bill) => {
      set((state) => ({ bills: [...state.bills, bill] }));
    },

    updateBill: (id, updates) => {
      set((state) => ({
        bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      }));
    },

    markBillPaid: (billId) => {
      set((state) => {
        const bill = state.bills.find((b) => b.id === billId);
        if (!bill) return state;

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Paid Bill: ${bill.name}`,
          amount: -bill.amount,
          type: 'expense',
          envelopeId: bill.envelopeId,
          isRecurringBill: true,
          billId: bill.id,
        };

        // Deduct from envelope if linked
        let updatedEnvelopes = state.envelopes;
        if (bill.envelopeId) {
          updatedEnvelopes = state.envelopes.map((e) =>
            e.id === bill.envelopeId
              ? { ...e, currentBalance: e.currentBalance - bill.amount }
              : e
          );
        }

        const updatedBills = state.bills.map((b) =>
          b.id === billId
            ? {
                ...b,
                isPaid: true,
                paidHistory: [
                  ...b.paidHistory,
                  {
                    billingCycleDueDate: bill.dueDate,
                    paymentDate: new Date().toISOString(),
                    transactionId: newTx.id,
                  },
                ],
              }
            : b
        );

        return {
          bills: updatedBills,
          transactions: [newTx, ...state.transactions],
          envelopes: updatedEnvelopes,
        };
      });
    },

    save: () => {
      const { profile, envelopes, paychecks, transactions, debts, bills, version } = get();
      StorageService.saveAppState({ profile, envelopes, paychecks, transactions, debts, bills, version });
    },
  };
});

// Auto-save on every state change
useStore.subscribe(() => {
  // Use setTimeout to avoid saving during React render cycles
  setTimeout(() => {
    const state = useStore.getState();
    state.save();
  }, 0);
});
