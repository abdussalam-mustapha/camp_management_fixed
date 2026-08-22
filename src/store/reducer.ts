import type {
  AppState,
  Campaign,
  Creator,
  Deliverable,
  DeliverableMetrics,
  UserRole,
} from '../data/types';

// ── Action Types ──────────────────────────────────────────────
export type AppAction =
  // Campaigns
  | { type: 'CAMPAIGN_CREATE'; payload: Campaign }
  | { type: 'CAMPAIGN_UPDATE'; payload: { id: string; changes: Partial<Campaign> } }
  | { type: 'CAMPAIGN_ARCHIVE'; payload: { id: string } }
  | { type: 'CAMPAIGN_ADD_CREATOR'; payload: { campaignId: string; creatorId: string } }
  | { type: 'CAMPAIGN_REMOVE_CREATOR'; payload: { campaignId: string; creatorId: string } }
  // Creators
  | { type: 'CREATOR_ADD'; payload: Creator }
  | { type: 'CREATOR_UPDATE'; payload: { id: string; changes: Partial<Creator> } }
  // Deliverables
  | { type: 'DELIVERABLE_ASSIGN'; payload: Deliverable }
  | { type: 'DELIVERABLE_STATUS_UPDATE'; payload: { id: string; status: Deliverable['status']; meta?: Partial<Deliverable> } }
  | { type: 'DELIVERABLE_REMOVE'; payload: { id: string } }
  | { type: 'DELIVERABLE_UPDATE'; payload: { id: string; changes: Partial<Deliverable> } }
  // Metrics
  | { type: 'METRICS_LOG'; payload: DeliverableMetrics }
  | { type: 'METRICS_UPDATE'; payload: { id: string; changes: Partial<DeliverableMetrics> } }
  // Role
  | { type: 'ROLE_SWITCH'; payload: UserRole }
  // Theme & Brand
  | { type: 'THEME_TOGGLE' }
  | { type: 'THEME_SET'; payload: 'light' | 'dark' }
  | { type: 'BRAND_NAME_SET'; payload: string }
  | { type: 'MOBILE_MENU_TOGGLE' }
  // Reset
  | { type: 'RESET_STATE'; payload: AppState };

// ── Reducer ───────────────────────────────────────────────────
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'THEME_TOGGLE': {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      return { ...state, theme: nextTheme };
    }

    case 'THEME_SET':
      return { ...state, theme: action.payload };

    case 'BRAND_NAME_SET':
      return { ...state, activeBrandName: action.payload };

    case 'MOBILE_MENU_TOGGLE':
      return { ...state, isMobileMenuOpen: !state.isMobileMenuOpen };

    // ── Campaigns ──
    case 'CAMPAIGN_CREATE':
      return { ...state, campaigns: [...state.campaigns, action.payload] };

    case 'CAMPAIGN_UPDATE':
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      };

    case 'CAMPAIGN_ARCHIVE':
      return { ...state, campaigns: state.campaigns.filter(c => c.id !== action.payload.id) };

    case 'CAMPAIGN_ADD_CREATOR':
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.payload.campaignId && !c.creatorIds.includes(action.payload.creatorId)
            ? { ...c, creatorIds: [...c.creatorIds, action.payload.creatorId] }
            : c
        ),
      };

    case 'CAMPAIGN_REMOVE_CREATOR':
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.payload.campaignId
            ? { ...c, creatorIds: c.creatorIds.filter(id => id !== action.payload.creatorId) }
            : c
        ),
        // also remove their deliverables from this campaign
        deliverables: state.deliverables.filter(
          d => !(d.campaignId === action.payload.campaignId && d.creatorId === action.payload.creatorId)
        ),
      };

    // ── Creators ──
    case 'CREATOR_ADD':
      return { ...state, creators: [...state.creators, action.payload] };

    case 'CREATOR_UPDATE':
      return {
        ...state,
        creators: state.creators.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      };

    // ── Deliverables ──
    case 'DELIVERABLE_ASSIGN':
      return { ...state, deliverables: [...state.deliverables, action.payload] };

    case 'DELIVERABLE_STATUS_UPDATE': {
      const now = new Date().toISOString();
      const { id, status, meta } = action.payload;
      const timestamps: Partial<Deliverable> = {};
      if (status === 'in_review') timestamps.submittedAt = now;
      if (status === 'approved') timestamps.approvedAt = now;
      if (status === 'live') timestamps.liveAt = now;
      if (status === 'completed') timestamps.completedAt = now;
      return {
        ...state,
        deliverables: state.deliverables.map(d =>
          d.id === id ? { ...d, status, ...timestamps, ...(meta || {}) } : d
        ),
      };
    }

    case 'DELIVERABLE_UPDATE':
      return {
        ...state,
        deliverables: state.deliverables.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload.changes } : d
        ),
      };

    case 'DELIVERABLE_REMOVE':
      return {
        ...state,
        deliverables: state.deliverables.filter(d => d.id !== action.payload.id),
        metrics: state.metrics.filter(m => m.deliverableId !== action.payload.id),
      };

    // ── Metrics ──
    case 'METRICS_LOG':
      return { ...state, metrics: [...state.metrics, action.payload] };

    case 'METRICS_UPDATE':
      return {
        ...state,
        metrics: state.metrics.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.changes, updatedAt: new Date().toISOString() } : m
        ),
      };

    // ── Role ──
    case 'ROLE_SWITCH':
      return { ...state, currentRole: action.payload };

    // ── Reset ──
    case 'RESET_STATE':
      return action.payload;

    default:
      return state;
  }
}