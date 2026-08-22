import { useLocation } from 'react-router-dom';
import { Bell, Shield, Sun, Moon, Building2, User, Menu } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const TITLES: Record<string, string> = {
  '/campaign-influencer': 'Campaigns',
  '/creators': 'Creators',
  '/reports': 'Reports & Analytics',
};

export default function TopBar() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const title = Object.entries(TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'Campaign Influencer';

  const pendingReviews = state.deliverables.filter(d => d.status === 'in_review').length;
  const isDark = state.theme === 'dark';

  const profileName = state.currentRole === 'brand' ? state.activeBrandName : 'Agency Admin';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-surface-800/60 bg-white dark:bg-surface-900 flex items-center justify-between px-6 shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-surface-400 dark:hover:text-white"
          onClick={() => dispatch({ type: 'MOBILE_MENU_TOGGLE' })}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={() => dispatch({ type: 'THEME_TOGGLE' })}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-surface-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800 transition-all cursor-pointer"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>

        {/* Role badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-surface-800/60 border border-slate-200 dark:border-surface-700/50 text-xs font-semibold text-slate-700 dark:text-surface-300">
          <Shield size={14} className={state.currentRole === 'agency' ? 'text-brand-600 dark:text-brand-400' : 'text-emerald-600 dark:text-accent-400'} />
          <span className="capitalize">{state.currentRole} View</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-surface-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800 transition-all cursor-pointer">
          <Bell size={18} />
          {pendingReviews > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {pendingReviews}
            </span>
          )}
        </button>

        {/* Login Profile Section with Brand Text ("Burger King") */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-surface-800">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-surface-800 border border-slate-200 dark:border-surface-700 flex items-center justify-center text-slate-600 dark:text-surface-300">
            {state.currentRole === 'brand' ? <Building2 size={16} className="text-brand-600 dark:text-brand-400" /> : <User size={16} />}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{profileName}</span>
            <span className="text-[10px] text-slate-500 dark:text-surface-400 uppercase tracking-wider">{state.currentRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}