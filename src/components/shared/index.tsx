import React from 'react';
import type { Platform, CampaignStatus, DeliverableStatus } from '../../data/types';
import { User } from 'lucide-react';

// ── SVG Platform Icons ─────────────────────────────────────────
export function PlatformIcon({ platform, size = 16, className = '' }: { platform: Platform; size?: number; className?: string }) {
  switch (platform) {
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-pink-500 ${className}`}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`text-slate-900 dark:text-slate-100 ${className}`}>
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 1 1-2.896-2.896c.307 0 .602.05.877.143V9.387a6.34 6.34 0 0 0-.877-.06 6.341 6.341 0 1 0 6.34 6.34V8.529a8.204 8.204 0 0 0 4.771 1.517V6.686z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`text-red-500 ${className}`}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`text-blue-600 ${className}`}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'x':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`text-slate-800 dark:text-slate-200 ${className}`}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    default:
      return <User size={size} className={className} />;
  }
}

// ── Status Pills ──────────────────────────────────────────────
const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, { bg: string; text: string; border: string }> = {
  draft:      { bg: 'bg-slate-100 dark:bg-surface-800/80', text: 'text-slate-600 dark:text-surface-300', border: 'border-slate-300 dark:border-surface-600/50' },
  executing:  { bg: 'bg-amber-50 dark:bg-sunset-500/20', text: 'text-amber-700 dark:text-sunset-300', border: 'border-amber-200 dark:border-sunset-500/40' },
  in_review:  { bg: 'bg-yellow-50 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-500/40' },
  approved:   { bg: 'bg-purple-50 dark:bg-brand-500/20', text: 'text-purple-700 dark:text-brand-300', border: 'border-purple-200 dark:border-brand-500/40' },
  live:       { bg: 'bg-emerald-50 dark:bg-accent-500/20', text: 'text-emerald-700 dark:text-accent-300', border: 'border-emerald-200 dark:border-accent-500/40' },
  completed:  { bg: 'bg-slate-100 dark:bg-surface-700/60', text: 'text-slate-500 dark:text-surface-400', border: 'border-slate-200 dark:border-surface-600/50' },
};

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft', executing: 'Executing', in_review: 'In Review',
  approved: 'Approved', live: 'Live', completed: 'Completed',
};

export function CampaignStatusPill({ status }: { status: CampaignStatus }) {
  const style = CAMPAIGN_STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {CAMPAIGN_STATUS_LABELS[status]}
    </span>
  );
}

const DELIVERABLE_STATUS_STYLES: Record<DeliverableStatus, { bg: string; text: string; border: string }> = {
  executing:          { bg: 'bg-amber-50 dark:bg-sunset-500/20', text: 'text-amber-700 dark:text-sunset-300', border: 'border-amber-200 dark:border-sunset-500/40' },
  in_review:          { bg: 'bg-yellow-50 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-500/40' },
  approved:           { bg: 'bg-purple-50 dark:bg-brand-500/20', text: 'text-purple-700 dark:text-brand-300', border: 'border-purple-200 dark:border-brand-500/40' },
  live:               { bg: 'bg-emerald-50 dark:bg-accent-500/20', text: 'text-emerald-700 dark:text-accent-300', border: 'border-emerald-200 dark:border-accent-500/40' },
  completed:          { bg: 'bg-slate-100 dark:bg-surface-700/60', text: 'text-slate-500 dark:text-surface-400', border: 'border-slate-200 dark:border-surface-600/50' },
  revision_requested: { bg: 'bg-rose-50 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/40' },
};

const DELIVERABLE_STATUS_LABELS: Record<DeliverableStatus, string> = {
  executing: 'Executing', in_review: 'In Review', approved: 'Approved',
  live: 'Live', completed: 'Completed', revision_requested: 'Revision Req.',
};

export function DeliverableStatusPill({ status }: { status: DeliverableStatus }) {
  const style = DELIVERABLE_STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {DELIVERABLE_STATUS_LABELS[status]}
    </span>
  );
}

// ── Platform Badge ────────────────────────────────────────────
const PLATFORM_STYLES: Record<Platform, { bg: string; text: string; border: string; label: string }> = {
  instagram: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800/40', label: 'Instagram' },
  tiktok:    { bg: 'bg-slate-100 dark:bg-surface-800', text: 'text-slate-800 dark:text-surface-200', border: 'border-slate-300 dark:border-surface-700', label: 'TikTok' },
  youtube:   { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800/40', label: 'YouTube' },
  facebook:  { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/40', label: 'Facebook' },
  x:         { bg: 'bg-slate-100 dark:bg-surface-800', text: 'text-slate-700 dark:text-surface-300', border: 'border-slate-300 dark:border-surface-700', label: 'X (Twitter)' },
};

export function PlatformBadge({ platform, size = 'sm' }: { platform: Platform; size?: 'sm' | 'xs' | 'lg' }) {
  const { bg, text, border, label } = PLATFORM_STYLES[platform];
  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border ${bg} ${text} ${border} ${sizes[size]}`}>
      <PlatformIcon platform={platform} size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      {label}
    </span>
  );
}

// ── Generic Badge ─────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
const BADGE_VARIANTS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: 'bg-slate-100 dark:bg-surface-800/80', text: 'text-slate-700 dark:text-surface-300', border: 'border-slate-200 dark:border-surface-600/50' },
  success: { bg: 'bg-emerald-50 dark:bg-accent-500/20', text: 'text-emerald-700 dark:text-accent-300', border: 'border-emerald-200 dark:border-accent-500/40' },
  warning: { bg: 'bg-amber-50 dark:bg-sunset-500/20', text: 'text-amber-700 dark:text-sunset-300', border: 'border-amber-200 dark:border-sunset-500/40' },
  danger:  { bg: 'bg-rose-50 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/40' },
  info:    { bg: 'bg-purple-50 dark:bg-brand-500/20', text: 'text-purple-700 dark:text-brand-300', border: 'border-purple-200 dark:border-brand-500/40' },
  brand:   { bg: 'bg-brand-500/10 dark:bg-brand-600/30', text: 'text-brand-700 dark:text-brand-200', border: 'border-brand-200 dark:border-brand-500/50' },
};

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const style = BADGE_VARIANTS[variant];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {children}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm',
  secondary: 'bg-white dark:bg-surface-800 hover:bg-slate-50 dark:hover:bg-surface-700 text-slate-800 dark:text-surface-200 border border-slate-300 dark:border-surface-600 font-semibold shadow-sm',
  ghost:     'hover:bg-slate-100 dark:hover:bg-surface-800 text-slate-600 dark:text-surface-300 hover:text-slate-900 dark:hover:text-white font-semibold',
  danger:    'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm',
};

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  icon: 'p-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Avatar ────────────────────────────────────────────────────
// Clean basic profile silhouette icon by default
export function Avatar({ src, name, size = 'md' }: { src?: string; name: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = { 
    xs: 'w-6 h-6 text-[10px]', 
    sm: 'w-8 h-8 text-xs', 
    md: 'w-10 h-10 text-sm', 
    lg: 'w-12 h-12 text-base', 
    xl: 'w-14 h-14 text-lg' 
  };
  const iconSizes = { xs: 12, sm: 16, md: 20, lg: 24, xl: 28 };
  
  // Render real image if provided and not a generic colourful dicebear url, or render basic profile icon
  const isCustomImage = src && !src.includes('dicebear');
  if (isCustomImage) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-1 ring-slate-200 dark:ring-surface-700`} />;
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-slate-100 dark:bg-surface-800 border border-slate-200 dark:border-surface-700 flex items-center justify-center text-slate-500 dark:text-surface-300 font-semibold shrink-0`}>
      <User size={iconSizes[size]} />
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
export function ProgressBar({ pct, color = 'brand' }: { pct: number; color?: 'brand' | 'accent' | 'sunset' | 'rose' }) {
  const colors = {
    brand: 'bg-brand-600',
    accent: 'bg-emerald-500',
    sunset: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
  return (
    <div className="w-full bg-slate-100 dark:bg-surface-800 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-surface-700/60">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colors[color]}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ── Stat Card (Reduced Numbers Typography) ─────────────────────
export function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-2 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-surface-400 text-[11px] font-semibold uppercase tracking-wider">{label}</p>
        {icon && <span className="text-slate-400 dark:text-surface-400">{icon}</span>}
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {sub && <p className="text-slate-500 dark:text-surface-400 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-surface-800 flex items-center justify-center text-slate-400 dark:text-surface-500 border border-slate-200 dark:border-surface-700">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-slate-800 dark:text-surface-200 font-semibold text-lg">{title}</p>
        {description && <p className="text-slate-500 dark:text-surface-400 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative w-full ${widths[size]} glass-card shadow-xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-surface-700`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-surface-800 bg-slate-50/50 dark:bg-surface-900/50">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer text-xl leading-none p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-800">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

// ── Input (Search Icon Overlap Fix) ────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className = '', ...rest } = props;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-slate-700 dark:text-surface-300 text-xs font-semibold">{label}</label>}
      <input
        className={`input-premium w-full rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-surface-200 text-sm placeholder-slate-400 dark:placeholder-surface-500 ${className}`}
        {...rest}
      />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  const { label, options, className = '', ...rest } = props;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-slate-700 dark:text-surface-300 text-xs font-semibold">{label}</label>}
      <select
        className={`input-premium w-full rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-surface-200 text-sm cursor-pointer ${className}`}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, className = '', ...rest } = props;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-slate-700 dark:text-surface-300 text-xs font-semibold">{label}</label>}
      <textarea
        className={`input-premium w-full rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-surface-200 text-sm placeholder-slate-400 dark:placeholder-surface-500 resize-none ${className}`}
        {...rest}
      />
    </div>
  );
}

// ── Format helpers ────────────────────────────────────────────
export function formatNumber(n: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// ── Custom scrollbar for overflow containers ─────────────────
export function customScrollbar() {
  return 'custom-scrollbar';
}