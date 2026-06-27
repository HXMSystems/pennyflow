import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, ArrowUpRight, TrendingDown, Filter } from 'lucide-react';

export default function Transactions() {
  const transactions = useStore((s) => s.transactions);
  const envelopes = useStore((s) => s.envelopes);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [envelopeFilter, setEnvelopeFilter] = useState('all');

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (envelopeFilter !== 'all' && tx.envelopeId !== envelopeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return tx.description.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, envelopeFilter]);

  const totalIn = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transaction Ledger</h1>
        <p className="text-slate-500 text-sm mt-1">{transactions.length} total transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>
          <div>
            <select
              value={envelopeFilter}
              onChange={(e) => setEnvelopeFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Envelopes</option>
              {envelopes.map((env) => (
                <option key={env.id} value={env.id}>{env.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Totals */}
        <div className="flex gap-6 mt-3 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-500">
            Income:{' '}
            <span className="font-semibold text-emerald-600">+${totalIn.toFixed(2)}</span>
          </p>
          <p className="text-xs text-slate-500">
            Expenses:{' '}
            <span className="font-semibold text-red-500">-${totalOut.toFixed(2)}</span>
          </p>
          <p className="text-xs text-slate-500">
            Net:{' '}
            <span className={`font-semibold ${totalIn - totalOut >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {totalIn - totalOut >= 0 ? '+' : '-'}${Math.abs(totalIn - totalOut).toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No transactions match your filters</p>
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); setEnvelopeFilter('all'); }}
              className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((tx) => {
              const env = envelopes.find((e) => e.id === tx.envelopeId);
              return (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
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
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {env ? ` • ${env.name}` : ''}
                        {tx.isRecurringBill && ' • Recurring Bill'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    {tx.envelopeId && env && (
                      <p className="text-[10px] text-slate-400">
                        Envelope balance: ${env.currentBalance.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <p className="text-xs text-slate-400">
            Showing {filtered.length} of {transactions.length} transactions
          </p>
        </div>
      </div>
    </div>
  );
}