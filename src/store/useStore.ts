import { create } from 'zustand';
import type { AppState, UserProfile, Envelope, Paycheck, Transaction, Debt, Bill } from '../types';
import { StorageService } from '../services/storage';

interface StoreState extends AppState {
  // Actions
  setProfile: (profile: UserProfile) => void;
  addEnvelope: (envelope: Envelope) => void;
  updateEnvelope: (envelope: Envelope) => void;
  deleteEnvelope: (id: string) => void;
  addPaycheck: (paycheck: Paycheck) => void;
  updatePaycheck: (paycheck: Paycheck) => void;
  addTransaction: (transaction: Transaction) => void;
  addDebt: (debt: Debt) => void;
  updateDebt: (debt: Debt) => void;
  addBill: (bill: Bill) => void;
  updateBill: (bill: Bill) => void;
  
  // Persistence
  save: () => void;
}

export const useStore = create<StoreState>((set, get) => {
  const initialState = StorageService.getAppState();

  return {
    ...initialState,

    setProfile: (profile) => set({ profile }),
    
    addEnvelope: (envelope) => set((state) => ({ 
      envelopes: [...state.envelopes, envelope] 
    })),
    
    updateEnvelope: (envelope) => set((state) => ({
      envelopes: state.envelopes.map((e) => (e.id === envelope.id ? envelope : e))
    })),
    
    deleteEnvelope: (id) => set((state) => ({
      envelopes: state.envelopes.filter((e) => e.id !== id)
    })),

    addPaycheck: (paycheck) => set((state) => ({
      paychecks: [...state.paychecks, paycheck]
    })),

    updatePaycheck: (paycheck) => set((state) => ({
      paychecks: state.paychecks.map((p) => (p.id === paycheck.id ? paycheck : p))
    })),

    addTransaction: (transaction) => set((state) => ({
      transactions: [transaction, ...state.transactions]
    })),

    addDebt: (debt) => set((state) => ({
      debts: [...state.debts, debt]
    })),

    updateDebt: (debt) => set((state) => ({
      debts: state.debts.map((d) => (d.id === debt.id ? debt : d))
    })),

    addBill: (bill) => set((state) => ({
      bills: [...state.bills, bill]
    })),

    updateBill: (bill) => set((state) => ({
      bills: state.bills.map((b) => (b.id === bill.id ? bill : b))
    })),

    save: () => {
      const { profile, envelopes, paychecks, transactions, debts, bills, version } = get();
      StorageService.saveAppState({ profile, envelopes, paychecks, transactions, debts, bills, version });
    },
  };
});

// Middleware to automatically save state on changes
useStore.subscribe((state) => {
  state.save();
});
