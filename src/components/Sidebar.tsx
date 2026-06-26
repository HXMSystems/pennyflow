import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingDown, 
  Calendar, 
  History,
  DollarSign
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/envelopes', icon: Wallet, label: 'Cash Envelopes' },
  { to: '/debt', icon: TrendingDown, label: 'Debt Tracker' },
  { to: '/bills', icon: Calendar, label: 'Bills' },
  { to: '/transactions', icon: History, label: 'Transactions' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">PennyFlow</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium">Free Tier</span>
          </div>
          <button className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors">
            UPGRADE TO PRO
          </button>
        </div>
      </div>
    </aside>
  );
}
