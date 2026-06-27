import { useStore } from '../store/useStore';
import { Calendar, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react';

export default function Bills() {
  const bills = useStore((s) => s.bills);
  const markBillPaid = useStore((s) => s.markBillPaid);

  const getDaysUntilDue = (dueDate: string): number => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = (bill: typeof bills[0]) => {
    if (bill.isPaid) return { label: 'Paid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
    const days = getDaysUntilDue(bill.dueDate);
    if (days < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertCircle };
    if (days <= 3) return { label: 'Due Soon', color: 'bg-amber-100 text-amber-700', icon: Clock };
    return { label: `In ${days} days`, color: 'bg-blue-100 text-blue-700', icon: Calendar };
  };

  // Sort: unpaid first, then by due date
  const sortedBills = [...bills].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills &amp; Subscriptions</h1>
          <p className="text-slate-500 text-sm mt-1">
            {bills.filter((b) => !b.isPaid).length} unpaid of {bills.length} total
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      {/* Bill list */}
      <div className="space-y-3">
        {sortedBills.map((bill) => {
          const status = getStatusInfo(bill);
          const StatusIcon = status.icon;
          return (
            <div
              key={bill.id}
              className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center justify-between transition-all ${
                bill.isPaid ? 'border-slate-100 opacity-70' : 'border-slate-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  bill.isPaid ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  <StatusIcon className={`w-5 h-5 ${
                    bill.isPaid ? 'text-emerald-600' : 'text-slate-600'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{bill.name}</p>
                  <p className="text-xs text-slate-400">
                    {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)} &bull; {bill.category}
                    {bill.envelopeId && (() => {
                      const env = useStore.getState().envelopes.find(e => e.id === bill.envelopeId);
                      return env ? ` &bull; ${env.name}` : '';
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">${bill.amount.toFixed(2)}</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                {!bill.isPaid && (
                  <button
                    onClick={() => markBillPaid(bill.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pay
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {bills.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No bills scheduled</p>
            <p className="text-sm text-slate-400 mt-1">Add your first bill to track payments.</p>
          </div>
        )}
      </div>
    </div>
  );
}