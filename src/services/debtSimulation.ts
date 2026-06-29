import type { Debt } from '../types';

export type Strategy = 'snowball' | 'avalanche' | 'minimums';

export interface SimulationMonth {
  month: number;
  date: string;
  balances: Record<string, number>; // debtId -> balance at end of month
  totalBalance: number;
  totalInterestPaid: number;
  totalPaid: number;
}

export interface SimulationResult {
  strategy: Strategy;
  monthsToFreedom: number;
  debtFreeDate: string;
  totalInterestPaid: number;
  totalPaid: number;
  monthlyData: SimulationMonth[];
  finalBalances: Record<string, number>;
}

/**
 * Sort debts by the given strategy.
 * Snowball: ascending balance. Ties broken by descending rate.
 * Avalanche: descending rate. Ties broken by ascending balance.
 * Minimums: no sorting (original order) — just pays mins, no extra.
 */
function sortDebts<T extends Debt>(debts: T[], strategy: Strategy): T[] {
  const sorted = [...debts];
  if (strategy === 'snowball') {
    sorted.sort((a, b) => {
      if (a.balance !== b.balance) return a.balance - b.balance;
      return b.interestRate - a.interestRate;
    });
  } else if (strategy === 'avalanche') {
    sorted.sort((a, b) => {
      if (a.interestRate !== b.interestRate) return b.interestRate - a.interestRate;
      return a.balance - b.balance;
    });
  }
  return sorted;
}

/**
 * Run a full debt payoff simulation.
 *
 * @param debts - The list of debts to simulate
 * @param monthlyBudget - Total monthly payment budget
 * @param strategy - Payment strategy
 * @param maxMonths - Safety limit (default 600 = 50 years)
 */
export function simulateDebtPayoff(
  debts: Debt[],
  monthlyBudget: number,
  strategy: Strategy = 'snowball',
  maxMonths = 600
): SimulationResult {
  // Deep clone debts to mutate during simulation
  const workingDebts = debts.map((d) => ({
    ...d,
    originalId: d.id as string,
    balance: d.balance,
    minimumPayment: d.minimumPayment,
    interestRate: d.interestRate,
    id: d.id,
    name: d.name,
    createdAt: d.createdAt,
  }));

  const sortedIds = sortDebts(workingDebts, strategy).map((d) => d.originalId);

  const monthlyData: SimulationMonth[] = [];
  let totalInterestPaid = 0;
  let totalPaid = 0;

  const now = new Date();
  let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let month = 1; month <= maxMonths; month++) {
    // Step 1: Add monthly interest to each active debt
    for (const debt of workingDebts) {
      if (debt.balance > 0) {
        const monthlyInterest = debt.balance * (debt.interestRate / 12);
        debt.balance += monthlyInterest;
        totalInterestPaid += monthlyInterest;
      }
    }

    // Step 2: Apply minimum payments
    for (const id of sortedIds) {
      const debt = workingDebts.find((d) => d.originalId === id);
      if (!debt || debt.balance <= 0) continue;
      const payment = Math.min(debt.minimumPayment, debt.balance);
      debt.balance -= payment;
      totalPaid += payment;
    }

    // Step 3: For snowball/avalanche, apply extra toward highest-priority debt
    if (strategy !== 'minimums') {
      const totalMinimums = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
      let extraRemaining = Math.max(0, monthlyBudget - totalMinimums);

      // If some debts are already paid off, their min payments roll over
      const activeDebts = workingDebts.filter((d) => d.balance > 0);
      if (activeDebts.length < workingDebts.length) {
        const paidMinAmount = debts
          .filter((d) => !activeDebts.some((a) => a.originalId === d.id))
          .reduce((sum, d) => sum + d.minimumPayment, 0);
        extraRemaining += paidMinAmount;
      }

      // Apply extra to highest-priority active debt
      for (const id of sortedIds) {
        const debt = workingDebts.find((d) => d.originalId === id);
        if (!debt || debt.balance <= 0 || extraRemaining <= 0) continue;
        const extraPayment = Math.min(extraRemaining, debt.balance);
        debt.balance -= extraPayment;
        totalPaid += extraPayment;
        extraRemaining -= extraPayment;
      }
    }

    // Record month state
    const balances: Record<string, number> = {};
    for (const debt of workingDebts) {
      balances[debt.originalId] = Math.max(0, debt.balance);
    }

    monthlyData.push({
      month,
      date: currentDate.toISOString().slice(0, 7), // YYYY-MM
      balances: { ...balances },
      totalBalance: workingDebts.reduce((s, d) => s + Math.max(0, d.balance), 0),
      totalInterestPaid,
      totalPaid,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);

    // Check if all debts are paid off
    const allPaid = workingDebts.every((d) => d.balance <= 0.01);
    if (allPaid) {
      // Cap the final balances at 0
      for (const debt of workingDebts) {
        if (debt.balance < 0.01) debt.balance = 0;
      }
      const finalBalances: Record<string, number> = {};
      for (const debt of debts) {
        finalBalances[debt.id] = 0;
      }
      return {
        strategy,
        monthsToFreedom: month,
        debtFreeDate: monthlyData[monthlyData.length - 1].date,
        totalInterestPaid,
        totalPaid,
        monthlyData,
        finalBalances,
      };
    }
  }

  // If we hit max months, return what we have
  const finalBalances: Record<string, number> = {};
  for (const debt of workingDebts) {
    finalBalances[debt.originalId] = Math.max(0, debt.balance);
  }

  return {
    strategy,
    monthsToFreedom: maxMonths,
    debtFreeDate: 'Beyond simulation range',
    totalInterestPaid,
    totalPaid,
    monthlyData,
    finalBalances,
  };
}

/**
 * Run all three strategies and return comparison results
 */
export function runFullComparison(
  debts: Debt[],
  monthlyBudget: number
): { snowball: SimulationResult; avalanche: SimulationResult; minimums: SimulationResult } {
  return {
    snowball: simulateDebtPayoff(debts, monthlyBudget, 'snowball'),
    avalanche: simulateDebtPayoff(debts, monthlyBudget, 'avalanche'),
    minimums: simulateDebtPayoff(debts, monthlyBudget, 'minimums'),
  };
}