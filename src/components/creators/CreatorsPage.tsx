import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { getCreatorOverallMetrics } from '../../store/selectors';
import { PlatformBadge, Button, Avatar, EmptyState, formatNumber, Modal, Input, Select } from '../shared';
import type { Creator, Platform, PlatformProfile } from '../../data/types';
import { v4 as uuid } from 'uuid';

export default function CreatorsPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [kpi, setKpi] = useState<'followers' | 'campaigns' | 'avgEr'>('followers');


  const filtered = state.creators.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.niche.some(n => n.toLowerCase().includes(search.toLowerCase())) ||
    c.platforms.some(p => p.handle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Creator Roster
          </h2>
          <p className="text-slate-500 dark:text-surface-400 text-xs font-medium mt-1">{state.creators.length} creators in your pool</p>
        </div>
        {state.currentRole === 'agency' && (
          <Button onClick={() => setShowAdd(true)} size="md">
            <Plus size={16} /> Add Creator
          </Button>
        )}
      </div>

      {/* Search Input - Fixed Overlap */}
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-slate-400 dark:text-surface-400 z-10 pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, niche, or handle..."
          className="input-premium w-full rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 dark:text-surface-200 placeholder-slate-400 dark:placeholder-surface-500"
        />
      </div>

      {/* KPI Selector */}
      <div className="flex items-center justify-end gap-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-surface-400">Display KPI:</label>
        <Select
          value={kpi}
          onChange={e => setKpi(e.target.value as any)}
          options={[
            { value: 'followers', label: 'Total Followers' },
            { value: 'campaigns', label: 'Active Campaigns' },
            { value: 'avgEr', label: 'Average Eng. Rate' },
          ]}
          className="text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No creators found"
          description="Add creators to build your roster"
          action={state.currentRole === 'agency' ? <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add Creator</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(c => <CreatorCard key={c.id} creator={c} kpi={kpi} />)}
        </div>
      )}

      <AddCreatorModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

function CreatorCard({ creator, kpi }: { creator: Creator; kpi: 'followers' | 'campaigns' | 'avgEr' }) {
  const { state } = useApp();
  const metrics = getCreatorOverallMetrics(state, creator.id);
  const totalFollowers = creator.platforms.reduce((s, p) => s + p.followers, 0);

  const kpiData = {
    followers: { value: formatNumber(totalFollowers), label: 'Followers' },
    campaigns: { value: metrics.activeCampaigns.length, label: 'Campaigns' },
    avgEr: { value: metrics.avgEngagementRate > 0 ? `${metrics.avgEngagementRate.toFixed(1)}%` : '—', label: 'Avg ER' },
  };
  const otherMetrics = (Object.keys(kpiData) as Array<keyof typeof kpiData>).filter(k => k !== kpi);


  return (
    <Link to={`/creators/${creator.id}`} className="block group">
      <div className="glass-card p-6 border border-slate-200 dark:border-surface-800/80 hover:border-brand-500/50 transition-all duration-200 h-full flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar src={creator.avatar} name={creator.name} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 dark:text-white font-bold text-lg leading-snug truncate group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">{creator.name}</p>
            <p className="text-slate-500 dark:text-surface-400 text-xs font-medium mt-0.5">{creator.location}</p>
          </div>
        </div>

        {/* Niche */}
        <div className="flex flex-wrap gap-2">
          {creator.niche.slice(0, 3).map(n => (
            <span key={n} className="px-2.5 py-1 bg-slate-100 dark:bg-surface-800 text-slate-700 dark:text-surface-300 text-xs rounded-md font-semibold border border-slate-200 dark:border-surface-700">{n}</span>
          ))}
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2 items-center">
          {creator.platforms.map(p => (
            <PlatformBadge key={p.platform} platform={p.platform} size="xs" />
          ))}
        </div>

        {/* Stats - KPI Driven */}
        <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-surface-800/80">
          <p className="text-slate-500 dark:text-surface-400 text-[10px] font-semibold uppercase tracking-wider">{kpiData[kpi].label}</p>
          <p className="text-slate-900 dark:text-white font-bold text-2xl mt-1">{kpiData[kpi].value}</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {otherMetrics.map(key => (
              <div key={key}>
                <p className="text-slate-500 dark:text-surface-400 text-[10px] font-semibold uppercase tracking-wider">{kpiData[key].label}</p>
                <p className="text-slate-900 dark:text-white font-bold text-sm mt-0.5">{kpiData[key].value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function AddCreatorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [niche, setNiche] = useState('');
  const [platforms, setPlatforms] = useState<PlatformProfile[]>([
    { platform: 'instagram', handle: '', followers: 0, verified: false },
  ]);

  const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'x', label: 'X (Twitter)' },
  ];

  function addPlatform() {
    setPlatforms(prev => [...prev, { platform: 'tiktok', handle: '', followers: 0, verified: false }]);
  }

  function updatePlatform(i: number, field: keyof PlatformProfile, value: string | number | boolean) {
    setPlatforms(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  function handleSubmit() {
    if (!name || !email) return;
    const creator: Creator = {
      id: `cr${uuid().slice(0, 8)}`,
      name, email, bio, location,
      niche: niche.split(',').map(n => n.trim()).filter(Boolean),
      platforms: platforms.filter(p => p.handle),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATOR_ADD', payload: creator });
    setName(''); setEmail(''); setBio(''); setLocation(''); setNiche('');
    setPlatforms([{ platform: 'instagram', handle: '', followers: 0, verified: false }]);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Creator" size="lg">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name *" value={name} onChange={e => setName(e.target.value)} placeholder="Creator name" />
          <Input label="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="creator@email.com" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
          <Input label="Niche (comma separated)" value={niche} onChange={e => setNiche(e.target.value)} placeholder="Beauty, Lifestyle, Fashion" />
        </div>
        <Input label="Bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Short creator bio..." />

        <div>
          <label className="text-slate-700 dark:text-surface-300 text-xs font-semibold block mb-2">Social Platforms</label>
          <div className="flex flex-col gap-2.5">
            {platforms.map((p, i) => (
              <div key={i} className="grid grid-cols-[140px_1fr_120px] gap-3">
                <Select
                  value={p.platform}
                  onChange={e => updatePlatform(i, 'platform', e.target.value)}
                  options={PLATFORM_OPTIONS}
                />
                <Input value={p.handle} onChange={e => updatePlatform(i, 'handle', e.target.value)} placeholder="@handle" />
                <Input type="number" value={p.followers || ''} onChange={e => updatePlatform(i, 'followers', Number(e.target.value))} placeholder="Followers" />
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addPlatform} className="self-start mt-1">
              <Plus size={14} /> Add Platform
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={!name || !email}>Add Creator</Button>
        </div>
      </div>
    </Modal>
  );
}