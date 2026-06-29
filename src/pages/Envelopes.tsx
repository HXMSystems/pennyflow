import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Target, Calendar, TrendingUp, AlertTriangle, Crown } from 'lucide-react';

function SinkingFundRing({ current, target, color }: { current: number; target: number; color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / target, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-slate-900">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number; color?: string }) {
  const spent = total - current;
  const spentPercent = total > 0 ? Math.min(spent / total, 1) * 100 : 0;
  const isOverspent = spent > total;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">
          {isOverspent ? 'Overspent' : 'Spent'}: ${Math.abs(spent).toFixed(2)}
        </span>
        <span className="text-slate-500">Remaining: ${Math.max(current, 0).toFixed(2)}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${
            isOverspent ? 'bg-red-500' : spentPercent > 80 ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(spentPercent, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-slate-400">$0</span>
        <span className="text-slate-400 font-medium">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

function getDaysUntilTarget(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  return Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getMonthsUntilTarget(targetDate: string): number {
  return Math.max(1, Math.ceil(getDaysUntilTarget(targetDate) / 30));
}

function calculateRequiredMonthly(target: number, current: number, targetDate: string): number {
  const months = getMonthsUntilTarget(targetDate);
  const remaining = target - current;
  return Math.max(0, remaining / months);
}

export default function Envelopes() {
  const envelopes = useStore((s) => s.envelopes);
  const transactions = useStore((s) => s.transactions);
  const profile = useStore((s) => s.profile);
  const [filter, setFilter] = useState<'all' | 'standard' | 'sinking'>('all');

  const standardEnvelopes = envelopes.filter((e) => !e.isSinkingFund);
  const sinkingFunds = envelopes.filter((e) => e.isSinkingFund);

  const displayedEnvelopes =
    filter === 'all' ? envelopes : filter === 'standard' ? standardEnvelopes : sinkingFunds;

  const getEnvelopeTransactions = (envelopeId: string) =>
    transactions.filter((t) => t.envelopeId === envelopeId).slice(0, 5);

  const [selectedEnvelope, setSelectedEnvelope] = useState<string | null>(null);
  const selectedEnv = envelopes.find((e) => e.id === selectedEnvelope);
  const selectedTxns = selectedEnv ? getEnvelopeTransactions(selectedEnv.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Envelopes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {standardEnvelopes.length} envelopes &bull; {sinkingFunds.length} sinking funds
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'standard', 'sinking'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'standard' ? 'Envelopes' : 'Sinking Funds'}
            </button>
          ))}
        </div>
      </div>

      {/* Envelope Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedEnvelopes.map((env) => (
          <div
            key={env.id}
            onClick={() => setSelectedEnvelope(env.id)}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: env.color }}
                />
                <h3 className="font-semibold text-slate-900">{env.name}</h3>
              </div>
              {env.isSinkingFund && (
                <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SINKING FUND
                </div>
              )}
            </div>

            {env.isSinkingFund ? (
              <>
                {/* Progress Ring */}
                <div className="flex justify-center mb-4">
                  <SinkingFundRing
                    current={env.currentBalance}
                    target={env.targetAmount || 0}
                    color={env.color}
                  />
                </div>
                {/* Details */}
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">
                    ${env.currentBalance.toFixed(2)}
                    <span className="text-sm font-normal text-slate-400">
                      {' '}/ ${env.targetAmount?.toFixed(2)}
                    </span>
                  </p>
                  {env.targetDate && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Target: {new Date(env.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {env.targetDate && env.targetAmount && (
                    <div className="mt-2 bg-emerald-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1 text-xs text-emerald-700">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-semibold">
                          Save ${calculateRequiredMonthly(env.targetAmount, env.currentBalance, env.targetDate).toFixed(2)}/month
                        </span>
                        <span className="text-emerald-500">to meet goal</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Balance */}
                <div className="mb-3">
                  <p className="text-2xl font-bold text-slate-900">
                    ${env.currentBalance.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Allocated: ${env.allocatedAmount.toFixed(2)}
                  </p>
                </div>
                {/* Progress Bar */}
                <ProgressBar
                  current={env.currentBalance}
                  total={env.allocatedAmount}
                  color={env.color}
                />
                {/* Overspent Warning */}
                {env.currentBalance < 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-medium">Over budget! Rebalance needed.</span>
                  </div>
                )}
              </>
            )}

            {/* Quick stats */}
            <div className="mt-3 pt-3 border-t border-slate-50">
              <p className="text-xs text-slate-400">
                {getEnvelopeTransactions(env.id).length} transactions this period
              </p>
            </div>
          </div>
        ))}

        {/* Add Envelope Card — Premium Gated */}
        {profile.isPremium || envelopes.length < 3 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 mt-3 group-hover:text-emerald-600">
              Add New Envelope
            </p>
            <p className="text-xs text-slate-400 mt-1">Create a new budget category</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-5 flex flex-col items-center justify-center min-h-[200px] bg-amber-50/30">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-amber-700 mt-3">
              Upgrade to Premium
            </p>
            <p className="text-xs text-amber-600 text-center mt-1">
              Free tier limited to 3 envelopes.<br />Unlock unlimited envelopes with Premium!
            </p>
            <button className="mt-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:from-amber-500 hover:to-yellow-600 transition-all shadow-sm">
              UPGRADE TO PRO — $4.99/mo
            </button>
          </div>
        )}
      </div>

      {/* Envelope Detail Modal */}
      {selectedEnv && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setSelectedEnvelope(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedEnv.color }}
                />
                <h2 className="text-xl font-bold text-slate-900">{selectedEnv.name}</h2>
              </div>
              {selectedEnv.isSinkingFund && (
                <div className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  SINKING FUND
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500">Current Balance</p>
                <p className="text-lg font-bold text-slate-900">${selectedEnv.currentBalance.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500">Allocated</p>
                <p className="text-lg font-bold text-slate-900">${selectedEnv.allocatedAmount.toFixed(2)}</p>
              </div>
            </div>

            {selectedEnv.isSinkingFund && selectedEnv.targetAmount && (
              <>
                <div className="flex justify-center my-4">
                  <SinkingFundRing
                    current={selectedEnv.currentBalance}
                    target={selectedEnv.targetAmount}
                    color={selectedEnv.color}
                  />
                </div>
                <div className="bg-amber-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Goal Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-amber-600 text-xs">Target Amount</p>
                      <p className="font-bold text-amber-900">${selectedEnv.targetAmount.toFixed(2)}</p>
                    </div>
                    {selectedEnv.targetDate && (
                      <>
                        <div>
                          <p className="text-amber-600 text-xs">Target Date</p>
                          <p className="font-bold text-amber-900">
                            {new Date(selectedEnv.targetDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-amber-600 text-xs">Months Left</p>
                          <p className="font-bold text-amber-900">{getMonthsUntilTarget(selectedEnv.targetDate)} months</p>
                        </div>
                        <div>
                          <p className="text-amber-600 text-xs">Needed Monthly</p>
                          <p className="font-bold text-amber-900">
                            ${calculateRequiredMonthly(selectedEnv.targetAmount, selectedEnv.currentBalance, selectedEnv.targetDate).toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Transaction History */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Recent Transactions</h3>
              {selectedTxns.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No transactions yet</p>
              ) : (
                <div className="space-y-1">
                  {selectedTxns.map((tx) => (
                    <div key={tx.id} className="flex justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-slate-700">{tx.description}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-medium text-red-500">-${Math.abs(tx.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEnvelope(null)}
              className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}