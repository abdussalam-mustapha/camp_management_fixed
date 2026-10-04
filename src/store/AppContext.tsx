import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState } from '../data/types';
import { appReducer, type AppAction } from './reducer';
import SEED from '../data/seed';

const STORAGE_KEY = 'camp_mgmt_state_v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return {
        ...SEED,
        ...parsed,
        theme: parsed.theme || 'light',
        activeBrandName: parsed.activeBrandName || 'Burger King',
        isMobileMenuOpen: false,
        platformConnections: parsed.platformConnections || [],
      };
    }
  } catch {
    /* ignore */
  }
  return SEED;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// ── Context ───────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  resetToSeed: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [state]);

  // Live Data Sync
  useEffect(() => {
    const syncLiveData = async () => {
      try {
        const { apiService } = await import('../utils/api');
        const { PlatformSyncService } = await import('../utils/platformSync');
        
        const connections = await apiService.getConnectedAccounts();
        if (connections.length === 0) return;

        // For each connection, fetch live profile and recent content to override dummy data
        for (const conn of connections) {
          try {
            // 1. Fetch live metrics (followers, reach)
            const liveMetrics = await PlatformSyncService.syncPlatformMetrics(conn, 'temp_id');
            const profile = await PlatformSyncService.getProfileData(conn);
            
            // Generate a unique creator ID based on the connection
            const creatorId = `live_creator_${conn.platformUserId}`;
            
            // 2. Dispatch a creator update/add with live stats
            dispatch({
              type: 'CREATOR_ADD',
              payload: {
                id: creatorId,
                name: profile.data?.name || profile.username || conn.profileData.name || 'Live Creator',
                bio: profile.data?.description || 'Connected via Integrations',
                niche: ['Live Data'],
                location: 'Earth',
                email: 'live@creator.com',
                platforms: [{
                  platform: conn.platform,
                  handle: profile.data?.username ? `@${profile.data.username}` : '@handle',
                  followers: liveMetrics.metrics?.reach || 0,
                  verified: profile.data?.verified || false
                }],
                createdAt: new Date().toISOString()
              }
            });

            // 2b. Add creator to the default campaign so it shows up in CampaignDetailPage
            dispatch({
              type: 'CAMPAIGN_ADD_CREATOR',
              payload: {
                campaignId: 'c1',
                creatorId: creatorId
              }
            });

            // 3. Fetch recent content
            const content = await PlatformSyncService.getRecentContent(conn, 5);
            
            // 4. Create deliverables and metrics for recent content
            if (content && content.length > 0) {
              content.forEach((post: any, index: number) => {
                const deliverableId = `live_deliv_${conn.platformUserId}_${index}`;
                
                // Create Deliverable
                dispatch({
                  type: 'DELIVERABLE_ASSIGN',
                  payload: {
                    id: deliverableId,
                    campaignId: 'c1', // Attach to first campaign for visibility
                    creatorId: creatorId,
                    platform: conn.platform,
                    type: conn.platform === 'x' ? 'tweet' : 'post',
                    description: post.text || post.caption || 'Live Content',
                    dueDate: new Date().toISOString(),
                    status: 'live',
                    liveAt: post.created_at || new Date().toISOString(),
                    createdAt: post.created_at || new Date().toISOString()
                  }
                });

                // Create Metrics
                const metricsId = `live_metric_${conn.platformUserId}_${index}`;
                const publicMetrics = post.public_metrics || {};
                const reach = liveMetrics.metrics?.reach || 1;
                const engagements = (publicMetrics.like_count || 0) + (publicMetrics.retweet_count || 0) + (publicMetrics.reply_count || 0);
                
                dispatch({
                  type: 'METRICS_LOG',
                  payload: {
                    id: metricsId,
                    deliverableId,
                    impressions: publicMetrics.impression_count || 0,
                    reach: reach,
                    likes: publicMetrics.like_count || 0,
                    comments: publicMetrics.reply_count || 0,
                    shares: publicMetrics.retweet_count || 0,
                    saves: 0,
                    views: 0,
                    clicks: 0,
                    engagementRate: (engagements / reach) * 100,
                    loggedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                });
              });
            }

          } catch (err) {
            console.error(`Failed to sync live data for ${conn.platform}`, err);
          }
        }
      } catch (err) {
        console.error('Failed to load connections for live sync', err);
      }
    };

    syncLiveData();
  }, []);

  function resetToSeed() {
    dispatch({ type: 'RESET_STATE', payload: SEED });
  }

  return (
    <AppContext.Provider value={{ state, dispatch, resetToSeed }}>
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}