import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, ExternalLink, Users, BarChart2, CheckCircle, Target } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { getCreatorOverallMetrics, getCampaignsForCreator } from '../../store/selectors';
import {
  PlatformIcon, DeliverableStatusPill, CampaignStatusPill,
  Avatar, StatCard, formatNumber
} from '../shared';

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();

  const creator = state.creators.find(c => c.id === id);
  if (!creator) return (
    <div className="flex items-center justify-center py-32 text-slate-500 dark:text-surface-400 font-medium">Creator not found.</div>
  );

  const metrics = getCreatorOverallMetrics(state, id!);
  const campaigns = getCampaignsForCreator(state, id!);
  const deliverables = state.deliverables.filter(d => d.creatorId === id);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/creators')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-surface-400 dark:hover:text-white transition-colors text-xs font-semibold cursor-pointer w-fit group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" /> Back to Creators
      </button>

      {/* Profile Header */}
      <div className="glass-card p-6 border border-slate-200 dark:border-surface-800">
        <div className="flex items-start gap-6">
          <Avatar src={creator.avatar} name={creator.name} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2">
              {creator.name}
            </h2>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-xs">
              {creator.location && (
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-surface-400">
                  <MapPin size={14} className="text-brand-600 dark:text-brand-400" />{creator.location}
                </span>
              )}
              {creator.email && (
                <a href={`mailto:${creator.email}`} className="flex items-center gap-1.5 text-slate-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-300 transition-colors">
                  <Mail size={14} className="text-emerald-600 dark:text-accent-400" />{creator.email}
                </a>
              )}
            </div>
            {creator.bio && <p className="text-slate-600 dark:text-surface-300 text-xs mt-3 max-w-2xl leading-relaxed">{creator.bio}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              {creator.niche.map(n => (
                <span key={n} className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-md border border-brand-200 dark:border-brand-800/40">{n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Platform profiles */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-surface-800/80">
          <h3 className="text-slate-500 dark:text-surface-400 text-[11px] font-bold uppercase tracking-wider mb-3">Social Platforms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {creator.platforms.map(p => (
              <div key={p.platform} className="flex items-center gap-3.5 px-4 py-3 bg-slate-50 dark:bg-surface-800/40 rounded-xl border border-slate-200 dark:border-surface-700/60">
                <PlatformIcon platform={p.platform} size={24} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white font-bold text-xs truncate">{p.handle}</p>
                  <p className="text-slate-500 dark:text-surface-400 text-[11px] mt-0.5">{formatNumber(p.followers)} followers</p>
                </div>
                {p.verified && (
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center shrink-0 text-[10px]" title="Verified">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Reach" value={formatNumber(metrics.totalReach)} icon={<Users size={18} />} />
        <StatCard label="Total Impressions" value={formatNumber(metrics.totalImpressions)} icon={<BarChart2 size={18} />} />
        <StatCard label="Total Engagements" value={formatNumber(metrics.totalEngagements)} icon={<CheckCircle size={18} />} />
        <StatCard
          label="Avg Eng. Rate"
          value={metrics.avgEngagementRate > 0 ? metrics.avgEngagementRate.toFixed(1) + '%' : '—'}
          icon={<Target size={18} />}
        />
      </div>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <div className="glass-card p-6 border border-slate-200 dark:border-surface-800">
          <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4">Campaigns ({campaigns.length})</h3>
          <div className="flex flex-col gap-3">
            {campaigns.map(c => (
              <Link key={c.id} to={`/campaigns/${c.id}`}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-surface-800/40 border border-slate-200 dark:border-surface-700/60 hover:border-brand-500/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-base shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${c.coverColor}dd, ${c.coverColor}77)` }}
                >
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors truncate">{c.name}</p>
                  <p className="text-slate-500 dark:text-surface-400 text-xs mt-0.5">{c.brand}</p>
                </div>
                <CampaignStatusPill status={c.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Deliverables Table */}
      {deliverables.length > 0 && (
        <div className="glass-card p-0 border border-slate-200 dark:border-surface-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-surface-800 bg-slate-50/50 dark:bg-surface-900/50">
            <h3 className="text-slate-900 dark:text-white font-bold text-sm">Deliverables ({deliverables.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100/70 dark:bg-surface-800/50">
                <tr className="border-b border-slate-200 dark:border-surface-700">
                  {['Campaign', 'Platform', 'Type', 'Description', 'Due Date', 'Status', 'Content'].map(h => (
                    <th key={h} className="text-slate-500 dark:text-surface-400 text-left py-3 px-4 font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-surface-700/50">
                {deliverables.map(d => {
                  const campaign = state.campaigns.find(c => c.id === d.campaignId);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-800 dark:text-surface-300 font-semibold">{campaign?.name ?? '—'}</td>
                      <td className="py-3 px-4"><PlatformIcon platform={d.platform} size={16} /></td>
                      <td className="py-3 px-4 text-slate-600 dark:text-surface-400 capitalize">{d.type}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-surface-300 max-w-xs truncate">{d.description}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-surface-400">{d.dueDate}</td>
                      <td className="py-3 px-4"><DeliverableStatusPill status={d.status} /></td>
                      <td className="py-3 px-4">
                        {d.postUrl ? (
                          <a href={d.postUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1">
                            <ExternalLink size={12} /> View
                          </a>
                        ) : d.contentUrl ? (
                          <a href={d.contentUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-surface-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
                            <ExternalLink size={12} /> Draft
                          </a>
                        ) : <span className="text-slate-400 dark:text-surface-600">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}