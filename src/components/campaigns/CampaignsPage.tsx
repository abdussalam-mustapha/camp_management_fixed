import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Package } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { getCampaignKPIs } from '../../store/selectors';
import {
  CampaignStatusPill, Button, EmptyState, ProgressBar, formatNumber
} from '../shared';
import CreateCampaignModal from './CreateCampaignModal';
import type { Campaign } from '../../data/types';

export default function CampaignsPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = state.campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Campaign Roster
          </h2>
          <p className="text-slate-500 dark:text-surface-400 text-xs font-medium mt-1">{state.campaigns.length} campaigns total</p>
        </div>
        {state.currentRole === 'agency' && (
          <Button onClick={() => setShowCreate(true)} size="md">
            <Plus size={16} /> New Campaign
          </Button>
        )}
      </div>

      {/* Search Bar - Fixed Overlap */}
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-slate-400 dark:text-surface-400 z-10 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search campaigns or brands..."
          className="input-premium w-full rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 dark:text-surface-200 placeholder-slate-400 dark:placeholder-surface-500"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="No campaigns found"
          description="Create your first campaign to get started"
          action={
            state.currentRole === 'agency'
              ? <Button onClick={() => setShowCreate(true)}><Plus size={16} /> New Campaign</Button>
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(c => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      )}

      <CreateCampaignModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { state } = useApp();
  const kpis = getCampaignKPIs(state, campaign.id);
  const creators = state.creators.filter(c => campaign.creatorIds.includes(c.id));

  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link to={`/campaigns/${campaign.id}`} className="block group">
      <div className="glass-card p-6 h-full flex flex-col gap-5 border border-slate-200 dark:border-surface-800/80 hover:border-brand-500/50 transition-all duration-200">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-white text-xl font-bold shadow-md"
              style={{ background: `linear-gradient(135deg, ${campaign.coverColor}dd, ${campaign.coverColor}77)` }}
            >
              {campaign.name[0]}
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg leading-snug truncate group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
              {campaign.name}
            </p>
            <p className="text-slate-500 dark:text-surface-400 text-xs font-semibold mt-1">{campaign.brand}</p>
          </div>
          <CampaignStatusPill status={campaign.status} />
        </div>

        {/* KPIs (Numbers typography reduced to elegant font size) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-surface-800/40 rounded-xl p-3.5 border border-slate-200/60 dark:border-surface-700/50">
            <p className="text-slate-500 dark:text-surface-400 text-[11px] font-semibold uppercase tracking-wider">Reach</p>
            <p className="text-slate-900 dark:text-white font-bold text-lg mt-1">{formatNumber(kpis.totalReach)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-surface-800/40 rounded-xl p-3.5 border border-slate-200/60 dark:border-surface-700/50">
            <p className="text-slate-500 dark:text-surface-400 text-[11px] font-semibold uppercase tracking-wider">Avg ER</p>
            <p className="text-slate-900 dark:text-white font-bold text-lg mt-1">{kpis.avgEngagementRate > 0 ? kpis.avgEngagementRate.toFixed(1) + '%' : '—'}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-surface-400 font-medium">Deliverables</span>
            <span className="text-slate-800 dark:text-surface-200 font-bold">{kpis.completedCount + kpis.liveCount}/{kpis.deliverableCount} done</span>
          </div>
          <ProgressBar pct={kpis.progressPct} color="brand" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/80 dark:border-surface-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-surface-400">
            <Users size={15} />
            <span className="font-semibold">{creators.length} creators</span>
          </div>
          <span className={`font-bold ${daysLeft < 0 ? 'text-slate-400 dark:text-surface-500' : daysLeft < 7 ? 'text-rose-500' : 'text-slate-500 dark:text-surface-400'}`}>
            {daysLeft < 0 ? 'Ended' : `${daysLeft}d left`}
          </span>
        </div>
      </div>
    </Link>
  );
}