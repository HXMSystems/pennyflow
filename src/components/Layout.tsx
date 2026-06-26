import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStore } from '../store/useStore';

export default function Layout() {
  const profile = useStore((state) => state.profile);

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
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">Net Worth</p>
              <p className="text-lg font-bold text-emerald-600">$14,250.00</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
              PB
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
