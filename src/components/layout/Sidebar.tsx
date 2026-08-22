import { NavLink } from 'react-router-dom';
import {
  Users, BarChart3, Megaphone,
  Zap, RefreshCw, Sun, Moon, Building2
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

const NAV = [
  { to: '/campaign-influencer', label: 'Campaigns', icon: Megaphone },
  { to: '/creators', label: 'Creators', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  const { state, dispatch, resetToSeed } = useApp();
  const isDark = state.theme === 'dark';

  return (
    <aside className="w-64 h-screen bg-white dark:bg-surface-900 border-r border-slate-200 dark:border-surface-800/60 flex flex-col transition-colors duration-200 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200 dark:border-surface-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <Zap size={18} />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-base tracking-tight">Campaign Influencer</p>
            <p className="text-slate-500 dark:text-surface-400 text-[10px] font-semibold uppercase tracking-widest">Influencer OS</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-600 dark:text-surface-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800/60'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-surface-800/60 space-y-3">
        {/* Brand Display Info when in Brand mode */}
        {state.currentRole === 'brand' && (
          <div className="px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/40 flex items-center gap-2.5">
            <Building2 size={16} className="text-brand-600 dark:text-brand-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider">Logged In Brand</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{state.activeBrandName}</p>
            </div>
          </div>
        )}

        {/* Role Switcher */}
        <div>
          <p className="text-slate-400 dark:text-surface-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1">Role Mode</p>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-surface-700/50 bg-slate-100 dark:bg-surface-800/40 p-0.5">
            {(['agency', 'brand'] as const).map(role => (
              <button
                key={role}
                onClick={() => dispatch({ type: 'ROLE_SWITCH', payload: role })}
                className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                  state.currentRole === role
                    ? 'bg-white dark:bg-brand-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-surface-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch({ type: 'THEME_TOGGLE' })}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 dark:text-surface-400 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-surface-700 text-slate-700 dark:text-surface-300">
            {state.theme}
          </span>
        </button>

        {/* Reset Button */}
        <button
          onClick={resetToSeed}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-surface-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw size={14} className="shrink-0" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
}