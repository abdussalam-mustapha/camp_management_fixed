import * as XLSX from 'xlsx';
import type { AppState } from '../data/types';
import { getCampaignKPIs, getCreatorMetricsForCampaign, getTopContent, getCreatorOverallMetrics } from '../store/selectors';

export function exportAllReportsToExcel(state: AppState) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Campaigns
  const campaignRows = state.campaigns.map(c => {
    const kpis = getCampaignKPIs(state, c.id);
    return {
      'Campaign Name': c.name,
      'Brand': c.brand,
      'Status': c.status,
      'Budget ($)': c.budget || 0,
      'Start Date': c.startDate,
      'End Date': c.endDate,
      'Total Reach': kpis.totalReach,
      'Total Impressions': kpis.totalImpressions,
      'Total Engagements': kpis.totalEngagements,
      'Avg Engagement Rate (%)': Number(kpis.avgEngagementRate.toFixed(2)),
      'Deliverables Total': kpis.deliverableCount,
      'Deliverables Completed': kpis.completedCount + kpis.liveCount,
      'Progress (%)': kpis.progressPct,
    };
  });
  const campaignsSheet = XLSX.utils.json_to_sheet(campaignRows);
  XLSX.utils.book_append_sheet(wb, campaignsSheet, 'Campaigns');

  // Sheet 2: Creators Roster
  const creatorRows = state.creators.map(c => {
    const metrics = getCreatorOverallMetrics(state, c.id);
    const totalFollowers = c.platforms.reduce((s, p) => s + p.followers, 0);
    const handles = c.platforms.map(p => `${p.platform}: ${p.handle}`).join(' | ');
    return {
      'Creator Name': c.name,
      'Email': c.email,
      'Location': c.location,
      'Niches': c.niche.join(', '),
      'Platforms & Handles': handles,
      'Total Followers': totalFollowers,
      'Active Campaigns': metrics.activeCampaigns.length,
      'Total Reach': metrics.totalReach,
      'Total Impressions': metrics.totalImpressions,
      'Total Engagements': metrics.totalEngagements,
      'Avg ER (%)': Number(metrics.avgEngagementRate.toFixed(2)),
    };
  });
  const creatorsSheet = XLSX.utils.json_to_sheet(creatorRows);
  XLSX.utils.book_append_sheet(wb, creatorsSheet, 'Creators Roster');

  // Sheet 3: All Deliverables & Metrics
  const deliverableRows = state.deliverables.map(d => {
    const campaign = state.campaigns.find(c => c.id === d.campaignId);
    const creator = state.creators.find(c => c.id === d.creatorId);
    const metric = state.metrics.find(m => m.deliverableId === d.id);
    return {
      'Campaign': campaign?.name || d.campaignId,
      'Brand': campaign?.brand || '',
      'Creator': creator?.name || d.creatorId,
      'Platform': d.platform,
      'Type': d.type,
      'Description': d.description,
      'Status': d.status,
      'Due Date': d.dueDate,
      'Reach': metric?.reach || 0,
      'Impressions': metric?.impressions || 0,
      'Likes': metric?.likes || 0,
      'Comments': metric?.comments || 0,
      'Shares': metric?.shares || 0,
      'Saves': metric?.saves || 0,
      'Views': metric?.views || 0,
      'Clicks': metric?.clicks || 0,
      'Engagement Rate (%)': metric?.engagementRate || 0,
    };
  });
  const deliverablesSheet = XLSX.utils.json_to_sheet(deliverableRows);
  XLSX.utils.book_append_sheet(wb, deliverablesSheet, 'Deliverables');

  // Trigger download
  XLSX.writeFile(wb, `Campaign_Influencer_Master_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportCampaignReportToExcel(state: AppState, campaignId: string) {
  const campaign = state.campaigns.find(c => c.id === campaignId);
  if (!campaign) return;

  const wb = XLSX.utils.book_new();
  const kpis = getCampaignKPIs(state, campaignId);
  const creatorMetrics = getCreatorMetricsForCampaign(state, campaignId);
  const topContent = getTopContent(state, campaignId, 100);

  // Sheet 1: Campaign Overview
  const summaryData = [
    { Field: 'Campaign Name', Value: campaign.name },
    { Field: 'Brand Name', Value: campaign.brand },
    { Field: 'Status', Value: campaign.status },
    { Field: 'Objective', Value: campaign.objective },
    { Field: 'Budget ($)', Value: campaign.budget || 0 },
    { Field: 'Start Date', Value: campaign.startDate },
    { Field: 'End Date', Value: campaign.endDate },
    { Field: 'Total Reach', Value: kpis.totalReach },
    { Field: 'Total Impressions', Value: kpis.totalImpressions },
    { Field: 'Total Engagements', Value: kpis.totalEngagements },
    { Field: 'Avg Engagement Rate (%)', Value: `${kpis.avgEngagementRate.toFixed(2)}%` },
    { Field: 'Total Deliverables', Value: kpis.deliverableCount },
    { Field: 'Completed Deliverables', Value: kpis.completedCount + kpis.liveCount },
    { Field: 'Campaign Progress (%)', Value: `${kpis.progressPct}%` },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Campaign Overview');

  // Sheet 2: Campaign Creators Performance
  const creatorRows = creatorMetrics.map(cm => ({
    'Creator Name': cm.creatorName,
    'Total Reach': cm.totalReach,
    'Total Impressions': cm.totalImpressions,
    'Total Engagements': cm.totalEngagements,
    'Avg ER (%)': Number(cm.avgEngagementRate.toFixed(2)),
    'Deliverables Assigned': cm.deliverableCount,
    'Deliverables Completed': cm.completedCount,
  }));
  const creatorsSheet = XLSX.utils.json_to_sheet(creatorRows);
  XLSX.utils.book_append_sheet(wb, creatorsSheet, 'Creator Breakdown');

  // Sheet 3: Campaign Deliverables & Performance
  const deliverableRows = topContent.map(({ deliverable: d, metrics: m, creator }) => ({
    'Creator Name': creator?.name || '',
    'Platform': d.platform,
    'Content Type': d.type,
    'Description': d.description,
    'Status': d.status,
    'Due Date': d.dueDate,
    'Reach': m?.reach || 0,
    'Impressions': m?.impressions || 0,
    'Likes': m?.likes || 0,
    'Comments': m?.comments || 0,
    'Shares': m?.shares || 0,
    'Saves': m?.saves || 0,
    'Views': m?.views || 0,
    'Clicks': m?.clicks || 0,
    'ER (%)': m?.engagementRate || 0,
  }));
  const deliverablesSheet = XLSX.utils.json_to_sheet(deliverableRows);
  XLSX.utils.book_append_sheet(wb, deliverablesSheet, 'Deliverables & Metrics');

  const safeName = campaign.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Campaign_Report_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
