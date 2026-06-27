import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStore } from '../store/useStore';
import { Crown } from 'lucide-react';

export default function Layout() {
  const profile = useStore((state) => state.profile);
  const envelopes = useStore((s) => s.envelopes);
  const debts = useStore((s) => s.debts);

  const totalBalance = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile.name}</h1>
            <p className="text-slate-500">Manage your money with precision.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Premium Badge */}
            {profile.isPremium ? (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                PREMIUM
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-xs font-medium">
                Free Tier
              </div>
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">Net Worth</p>
              <p className={`text-lg font-bold ${totalBalance - totalDebt >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${(totalBalance - totalDebt).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}