import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, BarChart3, Play, TrendingDown, Calendar } from 'lucide-react';
import { runFullComparison, type Strategy } from '../services/debtSimulation';
import PayoffChart, { StrategyLegend } from '../components/PayoffChart';

export default function DebtTracker() {
  const debts = useStore((s) => s.debts);
  const addDebt = useStore((s) => s.addDebt);
  const deleteDebt = useStore((s) => s.deleteDebt);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [minPayment, setMinPayment] = useState('');

  // Simulation state
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>(['snowball', 'avalanche']);
  const [hasRun, setHasRun] = useState(false);

  const comparison = useMemo(() => {
    if (debts.length === 0) return null;
    return runFullComparison(debts, monthlyBudget);
  }, [debts, monthlyBudget]);

  const handleRun = () => {
    setHasRun(true);
  };

  const toggleStrategy = (s: Strategy) => {
    setSelectedStrategies((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

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

  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalInterest = debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0);

  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatMonths = (months: number) => {
    if (months >= 600) return '50+ years';
    const years = Math.floor(months / 12);
    const m = months % 12;
    if (years === 0) return `${m} months`;
    return `${years}y ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Debt Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">
            {debts.length} active debts &bull; Snowball &amp; Avalanche simulator
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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm text-slate-500 font-medium">Total Balance</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            ${formatCurrency(debts.reduce((s, d) => s + d.balance, 0))}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm text-slate-500 font-medium">Monthly Minimum</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${formatCurrency(totalMinPayment)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm text-slate-500 font-medium">Annual Interest Cost</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            ${formatCurrency(totalInterest)}
          </p>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900">Payoff Simulator</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Monthly Payment Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number"
                min={totalMinPayment}
                step="50"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                className="w-32 pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {monthlyBudget < totalMinPayment && (
              <p className="text-xs text-red-500 mt-1">
                Must be at least ${formatCurrency(totalMinPayment)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Strategies</label>
            <div className="flex gap-2">
              {(['snowball', 'avalanche', 'minimums'] as Strategy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStrategy(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedStrategies.includes(s)
                      ? s === 'snowball'
                        ? 'bg-emerald-500 text-white'
                        : s === 'avalanche'
                        ? 'bg-purple-500 text-white'
                        : 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {s === 'snowball' ? 'Snowball' : s === 'avalanche' ? 'Avalanche' : 'Minimums'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={debts.length === 0 || monthlyBudget < totalMinPayment}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all mt-5"
          >
            <Play className="w-4 h-4" />
            Run Simulation
          </button>
        </div>
      </div>

      {/* Simulation Results */}
      {hasRun && comparison && (
        <>
          {/* Comparison Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedStrategies.map((s) => {
              const result = comparison[s];
              const min = comparison.minimums;
              const interestSaved = min ? min.totalInterestPaid - result.totalInterestPaid : 0;
              const monthsSaved = min ? min.monthsToFreedom - result.monthsToFreedom : 0;

              return (
                <div
                  key={s}
                  className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${
                    s === 'snowball'
                      ? 'border-l-emerald-500'
                      : s === 'avalanche'
                      ? 'border-l-purple-500'
                      : 'border-l-amber-500'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    {s === 'snowball' ? 'Snowball' : s === 'avalanche' ? 'Avalanche' : 'Minimums Only'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Debt-Free</span>
                      <span className="font-bold text-slate-900">
                        {result.debtFreeDate !== 'Beyond simulation range'
                          ? formatMonths(result.monthsToFreedom)
                          : result.debtFreeDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Interest</span>
                      <span className="font-bold text-red-500">
                        ${formatCurrency(result.totalInterestPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Paid</span>
                      <span className="font-bold text-slate-900">
                        ${formatCurrency(result.totalPaid)}
                      </span>
                    </div>

                    {s !== 'minimums' && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Interest Saved</span>
                          <span className="font-bold text-emerald-600">
                            ${formatCurrency(interestSaved)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Time Saved</span>
                          <span className="font-bold text-emerald-600">
                            {formatMonths(monthsSaved)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SVG Payoff Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Payoff Curves</h2>
              <StrategyLegend selectedStrategies={selectedStrategies} />
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <PayoffChart
                data={{
                  snowball: comparison.snowball.monthlyData,
                  avalanche: comparison.avalanche.monthlyData,
                  minimums: comparison.minimums.monthlyData,
                }}
                selectedStrategies={selectedStrategies}
              />
            </div>

            {/* Milestone markers */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
              {selectedStrategies.map((s) => {
                const result = comparison[s];
                return (
                  <div key={s} className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      <strong className="text-slate-700">
                        {s === 'snowball' ? 'Snowball' : s === 'avalanche' ? 'Avalanche' : 'Minimums'}
                      </strong>
                      : Debt-free{' '}
                      {result.debtFreeDate !== 'Beyond simulation range'
                        ? `by ${result.debtFreeDate}`
                        : '50+ years'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!hasRun && debts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Ready to simulate</p>
          <p className="text-sm text-slate-400 mt-1">
            Set your monthly budget above and click <strong>Run Simulation</strong>
          </p>
        </div>
      )}

      {/* Debt List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Debts</h2>
        <div className="space-y-3">
          {debts.map((debt) => (
            <div
              key={debt.id}
              className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{debt.name}</h3>
                  <button
                    onClick={() => deleteDebt(debt.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">Added {new Date(debt.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-right">
                <div>
                  <p className="text-xs text-slate-500">Balance</p>
                  <p className="text-sm font-bold text-slate-900">${formatCurrency(debt.balance)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rate</p>
                  <p className="text-sm font-bold text-red-500">{(debt.interestRate * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Min Payment</p>
                  <p className="text-sm font-bold text-slate-900">${formatCurrency(debt.minimumPayment)}</p>
                </div>
              </div>
            </div>
          ))}

          {debts.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No debts tracked yet</p>
              <p className="text-sm text-slate-400 mt-1">Add your first debt to start planning your payoff strategy.</p>
            </div>
          )}
        </div>
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