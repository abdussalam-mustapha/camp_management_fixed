import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Modal, Input, Textarea, Select, Button } from '../shared';
import type { Campaign, TrackingIdentifier } from '../../data/types';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface Props { open: boolean; onClose: () => void; }

type Step = 1 | 2 | 3;

export default function CreateCampaignModal({ open, onClose }: Props) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [coverColor, setCoverColor] = useState(COLORS[0]);

  // Step 2
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  // Step 3
  const [trackingItems, setTrackingItems] = useState<TrackingIdentifier[]>([
    { id: uuid(), type: 'hashtag', label: 'Main Hashtag', value: '' },
  ]);

  function reset() {
    setStep(1); setName(''); setBrand(''); setObjective(''); setDescription('');
    setStartDate(''); setEndDate(''); setBudget(''); setCoverColor(COLORS[0]);
    setSelectedCreators([]); setTrackingItems([{ id: uuid(), type: 'hashtag', label: '', value: '' }]);
  }

  function handleClose() { reset(); onClose(); }

  function handleSubmit() {
    const campaign: Campaign = {
      id: `c${uuid().slice(0, 8)}`,
      name, brand, objective, description,
      startDate, endDate,
      status: 'draft',
      budget: budget ? Number(budget) : undefined,
      creatorIds: selectedCreators,
      trackingIdentifiers: trackingItems.filter(t => t.value.trim()),
      coverColor,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'CAMPAIGN_CREATE', payload: campaign });
    handleClose();
  }

  function addTracking() {
    setTrackingItems(prev => [...prev, { id: uuid(), type: 'hashtag', label: '', value: '' }]);
  }

  function removeTracking(id: string) {
    setTrackingItems(prev => prev.filter(t => t.id !== id));
  }

  function updateTracking(id: string, field: keyof TrackingIdentifier, value: string) {
    setTrackingItems(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  const TRACKING_TYPES = [
    { value: 'hashtag', label: '# Hashtag' },
    { value: 'utm', label: 'UTM Link' },
    { value: 'coupon', label: 'Coupon Code' },
    { value: 'referral_link', label: 'Referral Link' },
    { value: 'other', label: 'Other' },
  ];

  const step1Valid = name && brand && objective && startDate && endDate;

  return (
    <Modal open={open} onClose={handleClose} title="Create New Campaign" size="lg">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step >= s ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-500/30' : 'bg-surface-800 text-surface-400 border border-surface-700'
            }`}>{s}</div>
            {s < 3 && <div className={`h-1 w-16 rounded-full transition-all duration-300 ${step > s ? 'bg-gradient-to-r from-brand-600 to-brand-700' : 'bg-surface-700'}`} />}
          </div>
        ))}
        <div className="ml-6">
          <p className="text-white font-bold text-lg flex items-center gap-2">
            {step === 1 && 'Campaign Details'}
            {step === 2 && 'Add Creators'}
            {step === 3 && 'Tracking Identifiers'}
            <Sparkles size={18} className="text-brand-400 animate-pulse-glow" />
          </p>
          <p className="text-surface-400 text-sm mt-1">
            {step === 1 && 'Basic information about the campaign.'}
            {step === 2 && `Assign creators from your roster.`}
            {step === 3 && 'Add tracking links, hashtags, or codes.'}
          </p>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Input label="Campaign Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Glow 2026" />
            <Input label="Brand *" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. LuminaSkin" />
          </div>
          <Input label="Objective *" value={objective} onChange={e => setObjective(e.target.value)} placeholder="What is the goal of this campaign?" />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Optionally, provide a campaign brief..." />
          <div className="grid grid-cols-2 gap-6">
            <Input label="Start Date *" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="End Date *" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Input label="Budget (optional)" type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0" />
          {/* Color picker */}
          <div>
            <label className="text-surface-300 text-sm font-bold block mb-3">Campaign Color</label>
            <div className="flex gap-4">
              {COLORS.map(c => (
                <button
                  key={c} onClick={() => setCoverColor(c)}
                  className={`w-10 h-10 rounded-xl transition-all duration-300 cursor-pointer border-2 ${coverColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <p className="text-surface-400 text-base">Select creators to include in this campaign. You can add more later.</p>
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar -mr-2 pr-2">
            {state.creators.map(creator => {
              const selected = selectedCreators.includes(creator.id);
              return (
                <button
                  key={creator.id}
                  onClick={() => setSelectedCreators(prev =>
                    selected ? prev.filter(id => id !== creator.id) : [...prev, creator.id]
                  )}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer text-left ${
                    selected
                      ? 'border-brand-500 bg-brand-600/20 shadow-lg shadow-brand-500/20'
                      : 'border-surface-700/50 bg-surface-800/50 hover:border-surface-600 hover:bg-surface-800/70'
                  }`}
                >
                  <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-xl avatar-glow" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg">{creator.name}</p>
                    <p className="text-surface-400 text-sm">{creator.niche.slice(0, 2).join(' · ')}</p>
                  </div>
                  <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                    selected ? 'border-brand-500 bg-brand-600' : 'border-surface-600 bg-surface-700/50'
                  }`}>
                    {selected && <div className="w-3 h-3 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-surface-400 text-base font-bold">{selectedCreators.length} creator{selectedCreators.length !== 1 ? 's' : ''} selected</p>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <p className="text-surface-400 text-base">Add campaign tracking identifiers (hashtags, UTMs, coupon codes, etc.)</p>
          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto custom-scrollbar -mr-2 pr-2">
            {trackingItems.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-[140px_1fr_auto] gap-4 items-end p-4 bg-surface-800/50 rounded-xl border border-surface-700/50">
                <Select
                  label={idx === 0 ? 'Type' : ''}
                  value={item.type}
                  onChange={e => updateTracking(item.id, 'type', e.target.value)}
                  options={TRACKING_TYPES}
                />
                <Input
                  label={idx === 0 ? 'Value' : ''}
                  value={item.value}
                  onChange={e => updateTracking(item.id, 'value', e.target.value)}
                  placeholder={item.type === 'hashtag' ? '#YourHashtag' : item.type === 'coupon' ? 'CODE20' : 'Enter value'}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTracking(item.id)}
                  className="text-surface-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  aria-label="Remove tracking item"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="md" onClick={addTracking} className="self-start">
            <Plus size={16} /> Add Identifier
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-700/50">
        <Button variant="secondary" onClick={step === 1 ? handleClose : () => setStep(s => (s - 1) as Step)}>
          {step === 1 ? 'Cancel' : <><ChevronLeft size={18} /> Back</>}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(s => (s + 1) as Step)} disabled={step === 1 && !step1Valid}>
            Next <ChevronRight size={18} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!name || !brand}>
            <Plus size={18} /> Create Campaign
          </Button>
        )}
      </div>
    </Modal>
  );
}