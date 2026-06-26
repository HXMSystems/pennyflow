import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowUpRight, TrendingDown, Wallet, PiggyBank, Plus, CheckCircle } from 'lucide-react';

function calculateUnallocated(paycheckAmount: number, allocations: { envelopeId: string; amount: number }[]) {
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  return paycheckAmount - totalAllocated;
}

export default function Dashboard() {
  const profile = useStore((s) => s.profile);
  const paychecks = useStore((s) => s.paychecks);
  const envelopes = useStore((s) => s.envelopes);
  const transactions = useStore((s) => s.transactions);
  const debts = useStore((s) => s.debts);
  const addTransaction = useStore((s) => s.addTransaction);
  const setPaycheckAllocation = useStore((s) => s.setPaycheckAllocation);
  const confirmPaycheckAllocation = useStore((s) => s.confirmPaycheckAllocation);

  const activePaycheck = paychecks.find((p) => !p.isAllocated);
  const unallocated = activePaycheck
    ? calculateUnallocated(activePaycheck.amount, activePaycheck.allocations)
    : 0;

  // Quick transaction form
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txEnvelopeId, setTxEnvelopeId] = useState('');

  const handleAddTransaction = () => {
    const amount = parseFloat(txAmount);
    if (!txDescription || isNaN(amount) || amount <= 0) return;
    addTransaction({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      description: txDescription,
      amount: -amount,
      type: 'expense',
      envelopeId: txEnvelopeId || undefined,
      isRecurringBill: false,
    });
    setTxDescription('');
    setTxAmount('');
    setTxEnvelopeId('');
  };

  const totalBalance = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Handle allocation inputs
  const [allocInputs, setAllocInputs] = useState<Record<string, string>>({});
  const getAllocFor = (envelopeId: string) => {
    if (allocInputs[envelopeId] !== undefined) return allocInputs[envelopeId];
    const existing = activePaycheck?.allocations.find((a) => a.envelopeId === envelopeId);
    return existing ? existing.amount.toString() : '0';
  };

  const handleAllocChange = (envelopeId: string, value: string) => {
    setAllocInputs((prev) => ({ ...prev, [envelopeId]: value }));
    const num = parseFloat(value) || 0;
    if (activePaycheck) {
      setPaycheckAllocation(activePaycheck.id, envelopeId, num);
    }
  };

  const handleConfirmAllocation = () => {
    if (activePaycheck && unallocated === 0) {
      confirmPaycheckAllocation(activePaycheck.id);
      setAllocInputs({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Net Worth Bar */}
      <div className="flex gap-4">
        <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Balance</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {profile.currency === 'USD' ? '$' : ''}{totalBalance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Debt</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {profile.currency === 'USD' ? '$' : ''}{totalDebt.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Net Worth</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {profile.currency === 'USD' ? '$' : ''}{(totalBalance - totalDebt).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">This Month</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {profile.currency === 'USD' ? '$' : ''}{(totalIncome - totalExpenses).toFixed(2)}
          </p>
          <p className="text-xs text-slate-400">Income - Expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paycheck Budget Allocator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Paycheck Allocator</h2>
          </div>
          {activePaycheck ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">{activePaycheck.source}</span>
                <span className="text-lg font-bold text-emerald-600">
                  ${activePaycheck.amount.toFixed(2)}
                </span>
              </div>

              {/* Unallocated Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Unallocated</span>
                  <span className={`font-bold ${unallocated === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ${unallocated.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      unallocated === 0 ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${((activePaycheck.amount - unallocated) / activePaycheck.amount) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {unallocated > 0
                    ? `${profile.currency === 'USD' ? '$' : ''}${unallocated.toFixed(2)} left to allocate`
                    : 'Every dollar has a job! 🎯'}
                </p>
              </div>

              {/* Allocation Inputs */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {envelopes.map((env) => (
                  <div key={env.id} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: env.color }}
                    />
                    <span className="text-sm text-slate-700 flex-1 truncate">{env.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={getAllocFor(env.id)}
                        onChange={(e) => handleAllocChange(env.id, e.target.value)}
                        className="w-20 text-right text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirmAllocation}
                disabled={unallocated !== 0}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  unallocated === 0
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {unallocated === 0 ? 'Confirm Allocation' : `Allocate $${unallocated.toFixed(2)} more`}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">All paychecks allocated!</p>
              <p className="text-sm text-slate-400">Add a new paycheck to start budgeting.</p>
              <button className="mt-3 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                + New Paycheck
              </button>
            </div>
          )}
        </div>

        {/* Quick Transaction Entry */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Quick Transaction</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <input
                type="text"
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                placeholder="e.g., Coffee shop"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Envelope (optional)</label>
              <select
                value={txEnvelopeId}
                onChange={(e) => setTxEnvelopeId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">No envelope</option>
                {envelopes.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name} (${env.currentBalance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddTransaction}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Log Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((tx) => {
            const env = envelopes.find((e) => e.id === tx.envelopeId);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                      {env ? ` • ${env.name}` : ''}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}