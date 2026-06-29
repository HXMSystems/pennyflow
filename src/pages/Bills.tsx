import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, CheckCircle2, AlertCircle, Clock, Plus, Crown } from 'lucide-react';

export default function Bills() {
  const bills = useStore((s) => s.bills);
  const profile = useStore((s) => s.profile);
  const markBillPaid = useStore((s) => s.markBillPaid);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  // Calendar grid helpers
  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];

    // Fill leading nulls
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // Fill trailing nulls
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return weeks;
  }, [currentYear, currentMonth]);

  const billsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sortedBills.filter((b) => b.dueDate === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills &amp; Subscriptions</h1>
          <p className="text-slate-500 text-sm mt-1">
            {bills.filter((b) => !b.isPaid).length} unpaid of {bills.length} total
          </p>
        </div>
        <div className="flex gap-2">
          {profile.isPremium && (
            <>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Calendar
              </button>
            </>
          )}
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" />
            Add Bill
          </button>
        </div>
      </div>

      {/* Calendar View (Premium only) */}
      {profile.isPremium && viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Due Soon</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Paid</span>
              </div>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {calendarDays.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  if (day === null) {
                    return <div key={`e-${di}`} className="min-h-[80px] rounded-lg bg-slate-50/50" />;
                  }
                  const dayBills = billsForDay(day);
                  const isToday = day === today.getDate();

                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] rounded-lg p-1.5 border transition-all ${
                        isToday
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${
                        isToday ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {day}
                      </p>
                      <div className="space-y-0.5">
                        {dayBills.slice(0, 2).map((bill) => (
                          <div
                            key={bill.id}
                            className={`text-[10px] px-1 py-0.5 rounded font-medium truncate ${
                              bill.isPaid
                                ? 'bg-emerald-100 text-emerald-700'
                                : getDaysUntilDue(bill.dueDate) < 0
                                ? 'bg-red-100 text-red-700'
                                : getDaysUntilDue(bill.dueDate) <= 3
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {bill.isPaid ? '✓ ' : ''}${bill.amount}
                          </div>
                        ))}
                        {dayBills.length > 2 && (
                          <p className="text-[10px] text-slate-400 pl-1">+{dayBills.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View (free + premium default) */
        <div className="space-y-3">
          {!profile.isPremium && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-4 mb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    Upgrade to Premium for Calendar View
                  </p>
                  <p className="text-xs text-amber-600">
                    See your bills on an interactive calendar with color-coded urgency.
                  </p>
                </div>
                <button className="text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-lg hover:from-amber-500 hover:to-yellow-600 transition-all">
                  UPGRADE
                </button>
              </div>
            </div>
          )}

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
      )}
    </div>
  );
}