import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart2, Trophy, TrendingUp, Plus, Edit2, Download, CheckCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  getCampaignKPIs, getCreatorMetricsForCampaign,
  getPlatformBreakdown, getTopContent
} from '../../store/selectors';
import {
  StatCard, Avatar, DeliverableStatusPill, PlatformBadge,
  formatNumber, Modal, Input, Button
} from '../shared';
import { exportAllReportsToExcel, exportCampaignReportToExcel } from '../../utils/excelExporter';
import type { DeliverableMetrics } from '../../data/types';
import { v4 as uuid } from 'uuid';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#ec4899',
  tiktok: '#64748b',
  youtube: '#ef4444',
  facebook: '#2563eb',
  x: '#475569',
};

const CHART_COLORS = ['#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#10b981', '#6366f1'];

type KPIOptionKey = 'totalReach' | 'totalImpressions' | 'totalEngagements' | 'avgEngagementRate' | 'completedCount';

const KPI_OPTIONS: { value: KPIOptionKey; label: string }[] = [
  { value: 'totalReach', label: 'Reach' },
  { value: 'totalImpressions', label: 'Impressions' },
  { value: 'totalEngagements', label: 'Engagements' },
  { value: 'avgEngagementRate', label: 'Avg Engagement Rate (%)' },
  { value: 'completedCount', label: 'Completed Deliverables' },
];

export default function ReportsPage() {
  const { id: paramId } = useParams<{ id?: string }>();
  const { state } = useApp();
  const [selectedId, setSelectedId] = useState(paramId ?? state.campaigns[0]?.id ?? '');
  const [metricsModal, setMetricsModal] = useState<string | null>(null); // deliverableId
  const [compareIds, setCompareIds] = useState<string[]>([]);
  
  // 1-2 Key KPI Selection State for Creator Performance Comparison Pane
  const [selectedKpi1, setSelectedKpi1] = useState<KPIOptionKey>('totalReach');
  const [selectedKpi2, setSelectedKpi2] = useState<KPIOptionKey>('avgEngagementRate');

  const campaign = state.campaigns.find(c => c.id === selectedId);

  const kpis = campaign ? getCampaignKPIs(state, selectedId) : null;
  const creatorMetrics = campaign ? getCreatorMetricsForCampaign(state, selectedId) : [];
  const platformBreakdown = campaign ? getPlatformBreakdown(state, selectedId) : [];
  const topContent = campaign ? getTopContent(state, selectedId, 10) : [];

  // Comparison data
  const compareData = compareIds.map(cid => {
    const cr = creatorMetrics.find(m => m.creatorId === cid);
    return cr ?? null;
  }).filter(Boolean);

  function toggleCompare(creatorId: string) {
    setCompareIds(prev =>
      prev.includes(creatorId) ? prev.filter(id => id !== creatorId) : prev.length < 3 ? [...prev, creatorId] : prev
    );
  }

  const getKpiLabel = (key: KPIOptionKey) => KPI_OPTIONS.find(o => o.value === key)?.label || key;
  const formatKpiValue = (key: KPIOptionKey, val: number) => {
    if (key === 'avgEngagementRate') return val > 0 ? val.toFixed(1) + '%' : '—';
    if (key === 'completedCount') return val.toString();
    return formatNumber(val);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-slate-500 dark:text-surface-400 text-xs font-medium mt-0.5">Campaign performance and KPI comparison</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Excel Export */}
          <Button
            onClick={() => exportAllReportsToExcel(state)}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <Download size={15} /> Export Master Excel
          </Button>

          {/* Campaign selector */}
          <select
            value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setCompareIds([]); }}
            className="input-premium rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-surface-200 cursor-pointer min-w-[200px]"
          >
            {state.campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!campaign || !kpis ? (
        <div className="flex items-center justify-center py-24 text-slate-500 dark:text-surface-400 text-sm font-medium">
          No campaign selected or no data available.
        </div>
      ) : (
        <>
          {/* Campaign Info Bar */}
          <div className="glass-card p-5 border border-slate-200 dark:border-surface-800 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ background: `linear-gradient(135deg, ${campaign.coverColor}cc, ${campaign.coverColor}44)` }}>
                {campaign.name[0]}
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold text-base">{campaign.name}</p>
                <p className="text-slate-500 dark:text-surface-400 text-xs">{campaign.brand} · {campaign.startDate} — {campaign.endDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportCampaignReportToExcel(state, campaign.id)}
                className="gap-1.5 text-xs"
              >
                <Download size={14} /> Campaign Excel Report
              </Button>
              <Link to={`/campaigns/${campaign.id}`} className="text-brand-600 dark:text-brand-400 hover:underline text-xs font-semibold">
                View Campaign →
              </Link>
            </div>
          </div>

          {/* KPI Cards (Subtle Typography) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Reach" value={formatNumber(kpis.totalReach)} icon={<TrendingUp size={18} />} />
            <StatCard label="Impressions" value={formatNumber(kpis.totalImpressions)} icon={<BarChart2 size={18} />} />
            <StatCard label="Engagements" value={formatNumber(kpis.totalEngagements)} icon={<CheckCircle size={18} />} />
            <StatCard
              label="Avg Eng. Rate"
              value={kpis.avgEngagementRate > 0 ? kpis.avgEngagementRate.toFixed(2) + '%' : '—'}
              sub={`${kpis.deliverableCount} deliverables · ${kpis.progressPct}% complete`}
            />
          </div>

          {/* KPI Selector Header & Creator Comparison Module */}
          <div className="glass-card p-6 border border-slate-200 dark:border-surface-800 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200 dark:border-surface-800 pb-4">
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2">
                  <BarChart2 size={18} className="text-brand-600 dark:text-brand-400" /> Creator KPI Performance & Comparison
                </h3>
                <p className="text-slate-500 dark:text-surface-400 text-xs mt-0.5">Select 1 or 2 key KPIs to compare across creator roster</p>
              </div>

              {/* Select 1 or 2 Key KPIs */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-surface-400 text-xs font-semibold">KPI 1:</span>
                  <select
                    value={selectedKpi1}
                    onChange={e => setSelectedKpi1(e.target.value as KPIOptionKey)}
                    className="input-premium rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                  >
                    {KPI_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-surface-400 text-xs font-semibold">KPI 2:</span>
                  <select
                    value={selectedKpi2}
                    onChange={e => setSelectedKpi2(e.target.value as KPIOptionKey)}
                    className="input-premium rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                  >
                    {KPI_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic Creator Performance Bar Chart */}
              <div className="flex flex-col gap-3">
                <p className="text-slate-700 dark:text-surface-300 text-xs font-bold uppercase tracking-wider">
                  Comparing {getKpiLabel(selectedKpi1)} vs {getKpiLabel(selectedKpi2)}
                </p>
                {creatorMetrics.length === 0 ? (
                  <p className="text-slate-400 dark:text-surface-400 text-xs py-16 text-center">No metric data logged yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={creatorMetrics} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                      <XAxis dataKey="creatorName" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => v.split(' ')[0]} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => formatNumber(v)} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: '12px' }}
                        formatter={(val: any, name: any) => [formatKpiValue(name as KPIOptionKey, Number(val)), getKpiLabel(name as KPIOptionKey)]}
                        cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                      />
                      <Bar dataKey={selectedKpi1} name={selectedKpi1} fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={22} />
                      <Bar dataKey={selectedKpi2} name={selectedKpi2} fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Platform Breakdown Donut */}
              <div className="flex flex-col gap-3">
                <p className="text-slate-700 dark:text-surface-300 text-xs font-bold uppercase tracking-wider">
                  Platform Reach Distribution
                </p>
                {platformBreakdown.length === 0 ? (
                  <p className="text-slate-400 dark:text-surface-400 text-xs py-16 text-center">No metric data logged yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={platformBreakdown} dataKey="reach" nameKey="platform" cx="50%" cy="50%" outerRadius={90} innerRadius={60} paddingAngle={3}>
                        {platformBreakdown.map((entry) => (
                          <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] ?? '#8b5cf6'} stroke={'transparent'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: '12px' }}
                        formatter={(v: any, name: any) => [formatNumber(Number(v) || 0), String(name)]}
                      />
                      <Legend formatter={(value) => <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Side-by-Side Selected Creators KPI Comparison Table */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-surface-800">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-slate-700 dark:text-surface-300 text-xs font-bold uppercase tracking-wider">Side-by-Side Creator Comparison</p>
                <p className="text-slate-500 dark:text-surface-400 text-xs">Select creators to compare key selected metrics</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {creatorMetrics.map(cm => (
                  <button
                    key={cm.creatorId}
                    onClick={() => toggleCompare(cm.creatorId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      compareIds.includes(cm.creatorId)
                        ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-700 dark:text-brand-300'
                        : 'bg-slate-100 dark:bg-surface-800/50 border-slate-200 dark:border-surface-700 text-slate-700 dark:text-surface-300 hover:bg-slate-200'
                    }`}
                  >
                    <Avatar src={cm.avatar} name={cm.creatorName} size="xs" />
                    {cm.creatorName}
                  </button>
                ))}
              </div>

              {compareData.length >= 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {compareData.map((cm, idx) => cm && (
                    <div key={cm.creatorId} className="bg-slate-50 dark:bg-surface-800/40 rounded-xl p-4 border border-slate-200 dark:border-surface-700/60 flex flex-col gap-3">
                      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-surface-700/60">
                        <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[idx] }} />
                        <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{cm.creatorName}</p>
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex justify-between items-center bg-white dark:bg-surface-900/50 p-2 rounded border border-slate-200/50 dark:border-surface-800">
                          <span className="text-slate-500 dark:text-surface-400 font-medium">{getKpiLabel(selectedKpi1)} (KPI 1)</span>
                          <span className="text-slate-900 dark:text-white font-bold">{formatKpiValue(selectedKpi1, cm[selectedKpi1])}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white dark:bg-surface-900/50 p-2 rounded border border-slate-200/50 dark:border-surface-800">
                          <span className="text-slate-500 dark:text-surface-400 font-medium">{getKpiLabel(selectedKpi2)} (KPI 2)</span>
                          <span className="text-slate-900 dark:text-white font-bold">{formatKpiValue(selectedKpi2, cm[selectedKpi2])}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5">
                          <span className="text-slate-500 dark:text-surface-400 font-medium">Deliverables</span>
                          <span className="text-slate-800 dark:text-surface-200 font-semibold">{cm.completedCount}/{cm.deliverableCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-surface-400 text-xs text-center py-6">Select at least 2 creators above to view comparative KPI breakdown</p>
              )}
            </div>
          </div>

          {/* Top Creators Roster */}
          <div className="glass-card p-6 border border-slate-200 dark:border-surface-800">
            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" /> Top Performing Creators
            </h3>
            <div className="flex flex-col">
              {[...creatorMetrics].sort((a, b) => b.totalReach - a.totalReach).slice(0, 5).map((cm, i) => (
                <div key={cm.creatorId} className="flex items-center gap-4 py-3 border-b border-slate-200 dark:border-surface-800/80 last:border-b-0 text-xs">
                  <span className="text-slate-400 dark:text-surface-500 font-bold w-6 text-center">#{i + 1}</span>
                  <Link to={`/creators/${cm.creatorId}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                    <Avatar src={cm.avatar} name={cm.creatorName} size="md" />
                    <span className="text-slate-900 dark:text-white font-semibold truncate">{cm.creatorName}</span>
                  </Link>
                  <div className="flex gap-8 shrink-0">
                    <div className="text-right">
                      <p className="text-slate-900 dark:text-white font-bold">{formatNumber(cm.totalReach)}</p>
                      <p className="text-slate-400 dark:text-surface-500 text-[10px] uppercase font-semibold">Reach</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 dark:text-white font-bold">{cm.avgEngagementRate > 0 ? cm.avgEngagementRate.toFixed(1) + '%' : '—'}</p>
                      <p className="text-slate-400 dark:text-surface-500 text-[10px] uppercase font-semibold">Avg ER</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 dark:text-white font-bold">{cm.completedCount}/{cm.deliverableCount}</p>
                      <p className="text-slate-400 dark:text-surface-500 text-[10px] uppercase font-semibold">Done</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Content Table */}
          <div className="glass-card p-6 border border-slate-200 dark:border-surface-800">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" /> Top Performing Content
              </h3>
              {state.currentRole === 'agency' && (
                <Button size="sm" onClick={() => setMetricsModal('new')}>
                  <Plus size={15} /> Log Metrics
                </Button>
              )}
            </div>
            {topContent.length === 0 ? (
              <p className="text-slate-400 dark:text-surface-400 text-xs text-center py-10">
                No performance data logged yet.{' '}
                {state.currentRole === 'agency' && (
                  <button onClick={() => setMetricsModal('new')} className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer font-semibold">Log metrics for a deliverable</button>
                )}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100/70 dark:bg-surface-800/50">
                    <tr className="border-b border-slate-200 dark:border-surface-700">
                      {['Creator', 'Platform', 'Content', 'Reach', 'Impressions', 'Engagements', 'ER', 'Status', ''].map(h => (
                        <th key={h} className="text-slate-500 dark:text-surface-400 text-left py-3 px-4 font-bold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-surface-700/50">
                    {topContent.map(({ deliverable: d, metrics: m, creator }) => (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-surface-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={creator?.avatar} name={creator?.name ?? '?'} size="sm" />
                            <span className="text-slate-800 dark:text-surface-200 font-semibold truncate">{creator?.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4"><PlatformBadge platform={d.platform} size="xs" /></td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="truncate font-medium text-slate-800 dark:text-surface-200">{d.description}</p>
                          <p className="text-slate-400 dark:text-surface-500 text-[10px]">{d.type}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">{formatNumber(m?.reach ?? 0)}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-surface-300">{formatNumber(m?.impressions ?? 0)}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-surface-300">{formatNumber((m?.likes ?? 0) + (m?.comments ?? 0) + (m?.shares ?? 0))}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${(m?.engagementRate ?? 0) > 5 ? 'text-emerald-600 dark:text-accent-400' : 'text-slate-700 dark:text-surface-200'}`}>
                            {m?.engagementRate ? m.engagementRate.toFixed(1) + '%' : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4"><DeliverableStatusPill status={d.status} /></td>
                        <td className="py-3 px-4">
                          {state.currentRole === 'agency' && (
                            <button onClick={() => setMetricsModal(d.id)} className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer p-1">
                              <Edit2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Metrics Log Modal */}
      {metricsModal && campaign && (
        <MetricsLogModal
          open={!!metricsModal}
          onClose={() => setMetricsModal(null)}
          campaignId={campaign.id}
          preselectedDeliverableId={metricsModal !== 'new' ? metricsModal : undefined}
        />
      )}
    </div>
  );
}

function MetricsLogModal({ open, onClose, campaignId, preselectedDeliverableId }: {
  open: boolean; onClose: () => void; campaignId: string; preselectedDeliverableId?: string;
}) {
  const { state, dispatch } = useApp();
  const deliverables = state.deliverables.filter(d => d.campaignId === campaignId && (d.status === 'live' || d.status === 'completed'));
  const [deliverableId, setDeliverableId] = useState(preselectedDeliverableId ?? deliverables[0]?.id ?? '');
  const [impressions, setImpressions] = useState('');
  const [reach, setReach] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [saves, setSaves] = useState('');
  const [views, setViews] = useState('');
  const [clicks, setClicks] = useState('');

  const existing = state.metrics.find(m => m.deliverableId === deliverableId);

  function handleSave() {
    const r = Number(reach) || 0;
    const l = Number(likes) || 0;
    const co = Number(comments) || 0;
    const sh = Number(shares) || 0;
    const er = r > 0 ? ((l + co + sh) / r) * 100 : 0;

    if (existing) {
      dispatch({
        type: 'METRICS_UPDATE',
        payload: {
          id: existing.id,
          changes: { impressions: Number(impressions), reach: r, likes: l, comments: co, shares: sh, saves: Number(saves), views: Number(views), clicks: Number(clicks), engagementRate: parseFloat(er.toFixed(2)) },
        },
      });
    } else {
      const m: DeliverableMetrics = {
        id: `m${uuid().slice(0, 8)}`,
        deliverableId,
        impressions: Number(impressions), reach: r, likes: l, comments: co, shares: sh,
        saves: Number(saves), views: Number(views), clicks: Number(clicks),
        engagementRate: parseFloat(er.toFixed(2)),
        loggedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'METRICS_LOG', payload: m });
    }
    onClose();
  }

  const deliverable = state.deliverables.find(d => d.id === deliverableId);
  const creator = deliverable ? state.creators.find(c => c.id === deliverable.creatorId) : null;

  return (
    <Modal open={open} onClose={onClose} title="Log Performance Metrics" size="md">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-slate-700 dark:text-surface-300 text-xs font-semibold block mb-2">Select Deliverable</label>
          <select
            value={deliverableId} onChange={e => setDeliverableId(e.target.value)}
            className="input-premium w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-surface-200 cursor-pointer"
          >
            {deliverables.map(d => {
              const cr = state.creators.find(c => c.id === d.creatorId);
              return <option key={d.id} value={d.id}>{cr?.name} — {d.type} ({d.platform})</option>;
            })}
          </select>
        </div>

        {deliverable && (
          <div className="p-3 bg-slate-50 dark:bg-surface-800/40 rounded-xl border border-slate-200 dark:border-surface-700/60 text-xs text-slate-600 dark:text-surface-400">
            <p className="text-slate-900 dark:text-white text-xs font-bold mb-1">{deliverable.description}</p>
            <p>{creator?.name} · {deliverable.platform} · {deliverable.type}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Impressions" type="number" value={impressions} onChange={e => setImpressions(e.target.value)} placeholder="0" />
          <Input label="Reach" type="number" value={reach} onChange={e => setReach(e.target.value)} placeholder="0" />
          <Input label="Likes" type="number" value={likes} onChange={e => setLikes(e.target.value)} placeholder="0" />
          <Input label="Comments" type="number" value={comments} onChange={e => setComments(e.target.value)} placeholder="0" />
          <Input label="Shares" type="number" value={shares} onChange={e => setShares(e.target.value)} placeholder="0" />
          <Input label="Saves" type="number" value={saves} onChange={e => setSaves(e.target.value)} placeholder="0" />
          <Input label="Video Views" type="number" value={views} onChange={e => setViews(e.target.value)} placeholder="0" />
          <Input label="Clicks" type="number" value={clicks} onChange={e => setClicks(e.target.value)} placeholder="0" />
        </div>

        {reach && (likes || comments || shares) && (
          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/40 rounded-xl text-xs">
            <p className="text-brand-700 dark:text-brand-300 font-semibold">
              Computed ER: <span className="font-bold">
                {(((Number(likes) + Number(comments) + Number(shares)) / Number(reach)) * 100).toFixed(2)}%
              </span>
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} className="flex-1" disabled={!deliverableId}>
            {existing ? 'Update Metrics' : 'Log Metrics'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}