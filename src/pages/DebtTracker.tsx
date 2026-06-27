import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, BarChart3, Crown, TrendingDown } from 'lucide-react';

export default function DebtTracker() {
  const debts = useStore((s) => s.debts);
  const profile = useStore((s) => s.profile);
  const addDebt = useStore((s) => s.addDebt);
  const deleteDebt = useStore((s) => s.deleteDebt);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [minPayment, setMinPayment] = useState('');

  const handleAdd = () => {
    const b = parseFloat(balance);
    const r = parseFloat(rate) / 100;
    const m = parseFloat(minPayment);
    if (!name || isNaN(b) || isNaN(r) || isNaN(m)) return;
    addDebt({
      id: `debt-${Date.now()}`,
      name,
      balance: b,
      interestRate: r,
      minimumPayment: m,
      createdAt: new Date().toISOString(),
    });
    setName('');
    setBalance('');
    setRate('');
    setMinPayment('');
    setShowAdd(false);
  };

  // Simple debt payoff simulation
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalInterest = debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Debt Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">
            {debts.length} active debts &bull; Snowball &amp; Avalanche ready
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Debt
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm text-slate-500 font-medium">Total Balance</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            ${debts.reduce((s, d) => s + d.balance, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm text-slate-500 font-medium">Monthly Minimum</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${totalMinPayment.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm text-slate-500 font-medium">Annual Interest Cost</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            ${totalInterest.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Premium Gate: Simulation Upsell for Free Users */}
      {!profile.isPremium && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-lg">Unlock Debt Payoff Simulator</h3>
              <p className="text-sm text-amber-700 mt-1">
                Compare <strong>Snowball</strong> (lowest balance first) vs <strong>Avalanche</strong> (highest interest first) strategies with interactive SVG payoff curves, debt-free date predictions, and interest savings calculations.
              </p>
              <button className="mt-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:from-amber-500 hover:to-yellow-600 transition-all shadow-sm">
                UPGRADE TO PREMIUM — $4.99/mo
              </button>
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs text-amber-600">
              <TrendingDown className="w-8 h-8 opacity-40" />
            </div>
          </div>
        </div>
      )}

      {/* Debt Cards */}
      <div className="space-y-3">
        {debts.map((debt) => (
          <div
            key={debt.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900">{debt.name}</h3>
                <p className="text-xs text-slate-400">Added {new Date(debt.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => deleteDebt(debt.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Balance</p>
                <p className="text-lg font-bold text-slate-900">${debt.balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Interest Rate</p>
                <p className="text-lg font-bold text-red-500">{(debt.interestRate * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Min Payment</p>
                <p className="text-lg font-bold text-slate-900">${debt.minimumPayment.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Monthly Interest</p>
                <p className="text-lg font-bold text-amber-600">
                  ${(debt.balance * debt.interestRate / 12).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {debts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No debts tracked yet</p>
            <p className="text-sm text-slate-400 mt-1">Add your first debt to start planning your payoff strategy.</p>
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Debt</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Debt Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Chase Credit Card"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="5000"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="18.99"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Minimum Monthly Payment ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={minPayment}
                  onChange={(e) => setMinPayment(e.target.value)}
                  placeholder="150"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                >
                  Add Debt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}