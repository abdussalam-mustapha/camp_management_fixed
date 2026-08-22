import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Hash, ExternalLink,
  Clock, BarChart2, Plus, Link2, Download
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { getCampaignKPIs } from '../../store/selectors';
import {
  CampaignStatusPill, DeliverableStatusPill, PlatformBadge,
  Button, Avatar, StatCard, formatNumber, Select, Modal, Input, Textarea
} from '../shared';
import { exportCampaignReportToExcel } from '../../utils/excelExporter';
import type { Deliverable, DeliverableStatus, Platform, DeliverableType } from '../../data/types';
import { v4 as uuid } from 'uuid';

const WORKFLOW: DeliverableStatus[] = ['executing', 'in_review', 'approved', 'live', 'completed'];

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const campaign = state.campaigns.find(c => c.id === id);
  if (!campaign) return (
    <div className="flex items-center justify-center py-32 text-slate-500 dark:text-surface-400 font-medium">Campaign not found.</div>
  );

  const creators = state.creators.filter(c => campaign.creatorIds.includes(c.id));
  const deliverables = state.deliverables.filter(d => d.campaignId === id);
  const kpis = getCampaignKPIs(state, id!);
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [approvalModal, setApprovalModal] = useState<Deliverable | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  function advanceStatus(deliverableId: string, current: DeliverableStatus) {
    const next = WORKFLOW[WORKFLOW.indexOf(current) + 1];
    if (!next) return;
    dispatch({ type: 'DELIVERABLE_STATUS_UPDATE', payload: { id: deliverableId, status: next } });
  }

  function requestRevision(d: Deliverable) {
    dispatch({
      type: 'DELIVERABLE_STATUS_UPDATE',
      payload: { id: d.id, status: 'revision_requested', meta: { revisionNote } },
    });
    setApprovalModal(null);
    setRevisionNote('');
  }

  function approve(d: Deliverable) {
    dispatch({ type: 'DELIVERABLE_STATUS_UPDATE', payload: { id: d.id, status: 'approved' } });
    setApprovalModal(null);
  }

  const inReview = deliverables.filter(d => d.status === 'in_review');

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-surface-400 dark:hover:text-white transition-colors text-xs font-semibold cursor-pointer w-fit group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" /> Back to Campaigns
      </button>

      {/* Header Card */}
      <div className="glass-card p-6 border border-slate-200 dark:border-surface-800">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md"
              style={{ background: `linear-gradient(135deg, ${campaign.coverColor}dd, ${campaign.coverColor}77)` }}
            >
              {campaign.name[0]}
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">
                {campaign.name}
              </h2>
              <p className="text-slate-500 dark:text-surface-400 text-xs font-semibold mt-1">{campaign.brand}</p>
              <p className="text-slate-600 dark:text-surface-300 text-xs mt-2 leading-relaxed max-w-2xl">{campaign.objective}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CampaignStatusPill status={campaign.status} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportCampaignReportToExcel(state, campaign.id)}
              className="gap-2"
              title="Download Campaign Excel Report"
            >
              <Download size={15} /> Export Campaign Excel
            </Button>
            {state.currentRole === 'agency' && (
              <Link to={`/reports`}>
                <Button variant="primary" size="sm"><BarChart2 size={15} /> Analytics</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-x-8 gap-y-3 mt-6 pt-5 border-t border-slate-200/80 dark:border-surface-800/80 flex-wrap text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-surface-400 font-medium">
            <span>{campaign.startDate} — {campaign.endDate}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-surface-400 font-medium">
            <span>{creators.length} creators</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-surface-400 font-medium">
            <span>{deliverables.length} deliverables</span>
          </div>
          {campaign.budget && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-surface-400 font-medium">
              <span className="text-slate-400 dark:text-surface-500">Budget:</span>
              <span className="text-slate-900 dark:text-white font-bold">${campaign.budget.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Reach" value={formatNumber(kpis.totalReach)} />
        <StatCard label="Impressions" value={formatNumber(kpis.totalImpressions)} />
        <StatCard label="Engagements" value={formatNumber(kpis.totalEngagements)} />
        <StatCard label="Avg Eng. Rate" value={kpis.avgEngagementRate > 0 ? kpis.avgEngagementRate.toFixed(1) + '%' : '—'} />
      </div>

      {/* Content Approval Queue */}
      {inReview.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-l-amber-500 border-y border-r border-slate-200 dark:border-surface-800">
          <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4 flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            Content Approval Queue
            <span className="ml-1 px-2 py-0.5 bg-amber-100 dark:bg-sunset-500/20 text-amber-800 dark:text-sunset-300 text-xs font-bold rounded-full">{inReview.length}</span>
          </h3>
          <div className="flex flex-col gap-3">
            {inReview.map(d => {
              const creator = state.creators.find(c => c.id === d.creatorId);
              return (
                <div key={d.id} className="flex items-center gap-4 px-4 py-3 bg-slate-50 dark:bg-surface-800/40 rounded-xl border border-slate-200 dark:border-surface-700/60">
                  <Avatar src={creator?.avatar} name={creator?.name ?? '?'} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white font-semibold text-sm truncate">{d.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <PlatformBadge platform={d.platform} size="xs" />
                      <span className="text-slate-500 dark:text-surface-400 font-medium">{creator?.name}</span>
                      {d.contentUrl && (
                        <a href={d.contentUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium">
                          <ExternalLink size={12} /> View Content
                        </a>
                      )}
                    </div>
                  </div>
                  {state.currentRole === 'agency' && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="danger" onClick={() => setApprovalModal(d)}>Review</Button>
                      <Button size="sm" onClick={() => approve(d)}>Approve</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Creators & Deliverables */}
      <div className="glass-card p-6 border border-slate-200 dark:border-surface-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 dark:text-white font-bold text-base">Creator Roster & Deliverables</h3>
          {state.currentRole === 'agency' && (
            <Button size="sm" variant="secondary" onClick={() => setShowAddDeliverable(true)}>
              <Plus size={15} /> Add Deliverable
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {creators.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-surface-400 text-sm font-medium">No creators assigned to this campaign yet.</p>
            </div>
          ) : creators.map(creator => {
            const cDeliverables = deliverables.filter(d => d.creatorId === creator.id);
            return (
              <div key={creator.id} className="border border-slate-200 dark:border-surface-700/60 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-surface-800/20">
                {/* Creator header */}
                <div className="flex items-center gap-3.5 px-4 py-3 bg-slate-100/70 dark:bg-surface-800/50 border-b border-slate-200 dark:border-surface-700/60">
                  <Avatar src={creator.avatar} name={creator.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/creators/${creator.id}`} className="text-slate-900 dark:text-white font-bold text-sm hover:text-brand-600 dark:hover:text-brand-300 transition-colors">{creator.name}</Link>
                    <div className="flex gap-1.5 mt-1">
                      {creator.platforms.map(p => <PlatformBadge key={p.platform} platform={p.platform} size="xs" />)}
                    </div>
                  </div>
                  <div className="text-slate-500 dark:text-surface-400 text-xs font-semibold">{cDeliverables.length} deliverable{cDeliverables.length !== 1 ? 's' : ''}</div>
                </div>
                {/* Deliverables table */}
                {cDeliverables.length > 0 && (
                  <div className="divide-y divide-slate-200 dark:divide-surface-700/50">
                    {cDeliverables.map(d => (
                      <DeliverableRow key={d.id} d={d} onAdvance={() => advanceStatus(d.id, d.status)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Identifiers */}
      {campaign.trackingIdentifiers.length > 0 && (
        <div className="glass-card p-6 border border-slate-200 dark:border-surface-800">
          <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4 flex items-center gap-2">
            Tracking Identifiers
          </h3>
          <div className="flex flex-wrap gap-4">
            {campaign.trackingIdentifiers.map(ti => (
              <div key={ti.id} className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-surface-800/40 rounded-xl border border-slate-200 dark:border-surface-700/60">
                {ti.type === 'hashtag' && <Hash size={14} className="text-brand-600 dark:text-brand-400" />}
                {(ti.type === 'utm' || ti.type === 'referral_link') && <Link2 size={14} className="text-emerald-600 dark:text-accent-400" />}
                {ti.type === 'coupon' && <span className="text-amber-600 dark:text-sunset-400 text-xs font-bold">%</span>}
                <div>
                  <p className="text-slate-500 dark:text-surface-400 text-[10px] font-bold uppercase tracking-wider">{ti.type.replace('_', ' ')}</p>
                  <p className="text-slate-900 dark:text-white text-xs font-bold mt-0.5">{ti.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Deliverable Modal */}
      <AddDeliverableModal
        open={showAddDeliverable}
        onClose={() => setShowAddDeliverable(false)}
        campaignId={campaign.id}
        creators={creators}
      />

      {/* Revision Modal */}
      <Modal open={!!approvalModal} onClose={() => setApprovalModal(null)} title="Request Revision" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-slate-600 dark:text-surface-400 text-xs">Provide feedback to the creator:</p>
          <Textarea
            label="Revision Notes"
            value={revisionNote}
            onChange={e => setRevisionNote(e.target.value)}
            rows={4}
            placeholder="What needs to be changed?"
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setApprovalModal(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={() => approvalModal && requestRevision(approvalModal)} className="flex-1" disabled={!revisionNote}>
              Request Revision
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DeliverableRow({ d, onAdvance }: { d: Deliverable; onAdvance: () => void }) {
  const { state } = useApp();
  const canAdvance = d.status !== 'completed' && d.status !== 'revision_requested';
  const nextStatus: Record<DeliverableStatus, string> = {
    executing: 'Mark In Review',
    in_review: 'Approve',
    approved: 'Mark Live',
    live: 'Complete',
    completed: '',
    revision_requested: 'Resubmit',
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-slate-100/50 dark:hover:bg-surface-800/40 transition-colors">
      <PlatformBadge platform={d.platform} size="xs" />
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 dark:text-surface-200 font-semibold text-xs truncate">{d.description}</p>
        <p className="text-slate-500 dark:text-surface-400 text-[11px] mt-0.5">Due {d.dueDate} · {d.type}</p>
        {d.revisionNote && <p className="text-rose-500 dark:text-rose-400 text-[11px] mt-1 italic">"{d.revisionNote}"</p>}
      </div>
      <DeliverableStatusPill status={d.status} />
      {state.currentRole === 'agency' && canAdvance && nextStatus[d.status] && (
        <Button size="sm" variant="ghost" onClick={onAdvance} className="shrink-0 text-xs font-semibold">
          {nextStatus[d.status]}
        </Button>
      )}
    </div>
  );
}

function AddDeliverableModal({ open, onClose, campaignId, creators }: {
  open: boolean; onClose: () => void; campaignId: string;
  creators: import('../../data/types').Creator[];
}) {
  const { dispatch } = useApp();
  const [creatorId, setCreatorId] = useState(creators[0]?.id ?? '');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [type, setType] = useState<DeliverableType>('reel');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const PLATFORMS: { value: Platform; label: string }[] = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'x', label: 'X (Twitter)' },
  ];

  const TYPES: { value: DeliverableType; label: string }[] = [
    { value: 'reel', label: 'Reel' },
    { value: 'post', label: 'Post' },
    { value: 'story', label: 'Story' },
    { value: 'video', label: 'Video' },
    { value: 'tweet', label: 'Tweet / Thread' },
    { value: 'short', label: 'Short' },
    { value: 'live', label: 'Live' },
  ];

  function handleSubmit() {
    if (!creatorId || !description || !dueDate) return;
    const d: Deliverable = {
      id: `d${uuid().slice(0, 8)}`,
      campaignId, creatorId, platform, type,
      description, dueDate,
      status: 'executing',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'DELIVERABLE_ASSIGN', payload: d });
    setDescription(''); setDueDate('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Deliverable" size="md">
      <div className="flex flex-col gap-4">
        <Select
          label="Creator"
          value={creatorId}
          onChange={e => setCreatorId(e.target.value)}
          options={creators.map(c => ({ value: c.id, label: c.name }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Platform" value={platform} onChange={e => setPlatform(e.target.value as Platform)} options={PLATFORMS} />
          <Select label="Content Type" value={type} onChange={e => setType(e.target.value as DeliverableType)} options={TYPES} />
        </div>
        <Textarea label="Description *" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the content to be created..." />
        <Input label="Due Date *" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={!description || !dueDate || !creatorId}>Add Deliverable</Button>
        </div>
      </div>
    </Modal>
  );
}