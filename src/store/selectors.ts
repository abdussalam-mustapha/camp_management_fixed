import type {
  AppState,
  CampaignKPIs,
  ContentPost,
  CreatorCampaignMetrics,
  Deliverable,
  Platform,
  PlatformBreakdown,
} from '../data/types';

// ── Campaign KPIs ─────────────────────────────────────────────
export function getCampaignKPIs(state: AppState, campaignId: string): CampaignKPIs {
  const deliverables = state.deliverables.filter(d => d.campaignId === campaignId);
  const deliverableIds = deliverables.map(d => d.id);
  const allMetrics = state.metrics.filter(m => deliverableIds.includes(m.deliverableId));

  const totalReach = allMetrics.reduce((s, m) => s + m.reach, 0);
  const totalImpressions = allMetrics.reduce((s, m) => s + m.impressions, 0);
  const totalEngagements = allMetrics.reduce((s, m) => s + m.likes + m.comments + m.shares, 0);
  const totalViews = allMetrics.reduce((s, m) => s + m.views, 0);
  const avgEngagementRate =
    allMetrics.length > 0
      ? allMetrics.reduce((s, m) => s + m.engagementRate, 0) / allMetrics.filter(m => m.engagementRate > 0).length || 0
      : 0;

  const doneStatuses: Deliverable['status'][] = ['approved', 'live', 'completed'];
  const completedCount = deliverables.filter(d => d.status === 'completed').length;
  const liveCount = deliverables.filter(d => d.status === 'live').length;
  const approvedCount = deliverables.filter(d => d.status === 'approved').length;
  const progressCount = deliverables.filter(d => doneStatuses.includes(d.status)).length;

  return {
    totalReach,
    totalImpressions,
    totalEngagements,
    totalViews,
    avgEngagementRate: isNaN(avgEngagementRate) ? 0 : avgEngagementRate,
    deliverableCount: deliverables.length,
    completedCount,
    liveCount,
    approvedCount,
    progressPct: deliverables.length > 0 ? Math.round((progressCount / deliverables.length) * 100) : 0,
  };
}

// ── Per-Creator Metrics within a Campaign ────────────────────
export function getCreatorMetricsForCampaign(
  state: AppState,
  campaignId: string
): CreatorCampaignMetrics[] {
  const campaign = state.campaigns.find(c => c.id === campaignId);
  if (!campaign) return [];

  return campaign.creatorIds.map(creatorId => {
    const creator = state.creators.find(c => c.id === creatorId)!;
    const deliverables = state.deliverables.filter(
      d => d.campaignId === campaignId && d.creatorId === creatorId
    );
    const metricsList = state.metrics.filter(m =>
      deliverables.map(d => d.id).includes(m.deliverableId)
    );

    const totalReach = metricsList.reduce((s, m) => s + m.reach, 0);
    const totalImpressions = metricsList.reduce((s, m) => s + m.impressions, 0);
    const totalEngagements = metricsList.reduce((s, m) => s + m.likes + m.comments + m.shares, 0);
    const validERs = metricsList.filter(m => m.engagementRate > 0);
    const avgEngagementRate =
      validERs.length > 0 ? validERs.reduce((s, m) => s + m.engagementRate, 0) / validERs.length : 0;

    return {
      creatorId,
      creatorName: creator?.name ?? 'Unknown',
      avatar: creator?.avatar ?? '',
      totalReach,
      totalImpressions,
      totalEngagements,
      avgEngagementRate,
      deliverableCount: deliverables.length,
      completedCount: deliverables.filter(d => d.status === 'completed').length,
    };
  });
}

// ── Platform Breakdown ────────────────────────────────────────
export function getPlatformBreakdown(
  state: AppState,
  campaignId: string
): PlatformBreakdown[] {
  const deliverables = state.deliverables.filter(d => d.campaignId === campaignId);
  const platformMap = new Map<Platform, PlatformBreakdown>();

  deliverables.forEach(d => {
    const metrics = state.metrics.find(m => m.deliverableId === d.id);
    const existing = platformMap.get(d.platform) ?? {
      platform: d.platform,
      reach: 0,
      impressions: 0,
      engagements: 0,
      deliverableCount: 0,
    };
    platformMap.set(d.platform, {
      ...existing,
      reach: existing.reach + (metrics?.reach ?? 0),
      impressions: existing.impressions + (metrics?.impressions ?? 0),
      engagements: existing.engagements + (metrics ? metrics.likes + metrics.comments + metrics.shares : 0),
      deliverableCount: existing.deliverableCount + 1,
    });
  });

  return Array.from(platformMap.values()).sort((a, b) => b.reach - a.reach);
}

// ── Top Performing Content ────────────────────────────────────
export function getTopContent(state: AppState, campaignId: string, limit = 10): ContentPost[] {
  const deliverables = state.deliverables.filter(d => d.campaignId === campaignId);

  return deliverables
    .map(d => ({
      deliverable: d,
      metrics: state.metrics.find(m => m.deliverableId === d.id),
      creator: state.creators.find(c => c.id === d.creatorId)!,
    }))
    .filter(cp => cp.metrics && cp.metrics.reach > 0)
    .sort((a, b) => (b.metrics?.reach ?? 0) - (a.metrics?.reach ?? 0))
    .slice(0, limit);
}

// ── Creator overall metrics (across all campaigns) ────────────
export function getCreatorOverallMetrics(state: AppState, creatorId: string) {
  const deliverables = state.deliverables.filter(d => d.creatorId === creatorId);
  const metricsList = state.metrics.filter(m =>
    deliverables.map(d => d.id).includes(m.deliverableId)
  );
  const totalReach = metricsList.reduce((s, m) => s + m.reach, 0);
  const totalImpressions = metricsList.reduce((s, m) => s + m.impressions, 0);
  const totalEngagements = metricsList.reduce((s, m) => s + m.likes + m.comments + m.shares, 0);
  const validERs = metricsList.filter(m => m.engagementRate > 0);
  const avgEngagementRate = validERs.length > 0
    ? validERs.reduce((s, m) => s + m.engagementRate, 0) / validERs.length
    : 0;
  const activeCampaigns = [...new Set(deliverables.map(d => d.campaignId))];

  return { totalReach, totalImpressions, totalEngagements, avgEngagementRate, activeCampaigns, deliverableCount: deliverables.length };
}

// ── Campaigns for a creator ───────────────────────────────────
export function getCampaignsForCreator(state: AppState, creatorId: string): typeof state.campaigns {
  return state.campaigns.filter(c => c.creatorIds.includes(creatorId));
}
