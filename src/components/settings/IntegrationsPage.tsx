import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { apiService, type PlatformConnection } from '../../utils/api';
import { PlatformIcon, Button, Avatar, Modal, formatNumber } from '../shared';
import type { Platform } from '../../data/types';

export default function IntegrationsPage() {
  const { state, dispatch } = useApp();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<PlatformConnection | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConnectedAccounts();
      setConnections(data);
      
      // Sync with local state
      data.forEach(conn => {
        const existingIndex = state.platformConnections.findIndex(
          pc => pc.platform === conn.platform && pc.platformUserId === conn.platformUserId
        );
        
        if (existingIndex >= 0) {
          dispatch({
            type: 'PLATFORM_CONNECTION_UPDATE',
            payload: {
              id: state.platformConnections[existingIndex].id,
              changes: { profileData: conn.profileData, lastSyncAt: new Date().toISOString() }
            }
          });
        } else {
          dispatch({
            type: 'PLATFORM_CONNECTION_ADD',
            payload: {
              id: `${conn.platform}_${conn.platformUserId}`,
              platform: conn.platform as Platform,
              platformUserId: conn.platformUserId,
              platformUsername: conn.profileData.username || conn.profileData.name || 'Unknown',
              profileData: conn.profileData,
              connectedAt: conn.connectedAt,
              lastSyncAt: new Date().toISOString(),
              isActive: true
            }
          });
        }
      });
    } catch (err) {
      setError('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform: Platform) => {
    let authUrl: string;
    switch (platform) {
      case 'instagram':
        authUrl = apiService.getInstagramAuthUrl();
        break;
      case 'tiktok':
        authUrl = apiService.getTikTokAuthUrl();
        break;
      case 'x':
        authUrl = apiService.getTwitterAuthUrl();
        break;
      case 'facebook':
        authUrl = apiService.getFacebookAuthUrl();
        break;
      default:
        return;
    }
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    if (!selectedConnection) return;

    try {
      await apiService.disconnectAccount(selectedConnection.platform, selectedConnection.platformUserId);
      dispatch({
        type: 'PLATFORM_CONNECTION_REMOVE',
        payload: { id: `${selectedConnection.platform}_${selectedConnection.platformUserId}` }
      });
      setConnections(connections.filter(c => c !== selectedConnection));
      setShowDisconnectModal(false);
      setSelectedConnection(null);
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  const handleSync = async (connection: PlatformConnection) => {
    try {
      setSyncing(connection.platformUserId);
      await loadConnections();
    } catch (err) {
      setError('Failed to sync account data');
    } finally {
      setSyncing(null);
    }
  };

  const platforms: { platform: Platform; name: string; description: string }[] = [
    { platform: 'instagram', name: 'Instagram', description: 'Connect your Instagram business account' },
    { platform: 'tiktok', name: 'TikTok', description: 'Connect your TikTok creator account' },
    { platform: 'x', name: 'X (Twitter)', description: 'Connect your X account' },
    { platform: 'facebook', name: 'Facebook', description: 'Connect your Facebook page' },
  ];

  const getConnectionStatus = (platform: Platform) => {
    return connections.find(c => c.platform === platform);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Platform Integrations
          </h2>
          <p className="text-slate-500 dark:text-surface-400 text-xs font-medium mt-1">
            Connect your social media accounts to sync metrics and profile data
          </p>
        </div>
        <Button onClick={loadConnections} size="md" variant="outline">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4">
          <p className="text-rose-700 dark:text-rose-300 text-sm">{error}</p>
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(({ platform, name, description }) => {
          const connection = getConnectionStatus(platform);
          const isConnected = !!connection;

          return (
            <div
              key={platform}
              className="glass-card p-6 border border-slate-200 dark:border-surface-800/80 rounded-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-surface-800 rounded-xl">
                    <PlatformIcon platform={platform} size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{name}</h3>
                    <p className="text-xs text-slate-500 dark:text-surface-400">{description}</p>
                  </div>
                </div>
                {isConnected ? (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={16} />
                    <span className="text-xs font-semibold">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400">
                    <XCircle size={16} />
                    <span className="text-xs font-semibold">Not Connected</span>
                  </div>
                )}
              </div>

              {isConnected && connection ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-surface-800/40 rounded-lg">
                    <Avatar 
                      src={connection.profileData.profile_picture_url || connection.profileData.picture?.data?.url}
                      name={connection.profileData.username || connection.profileData.name || 'User'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {connection.profileData.username || connection.profileData.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-surface-400">
                        Connected {new Date(connection.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSync(connection)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={syncing === connection.platformUserId}
                    >
                      {syncing === connection.platformUserId ? (
                        <RefreshCw size={14} className="animate-spin mr-2" />
                      ) : (
                        <RefreshCw size={14} className="mr-2" />
                      )}
                      Sync
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedConnection(connection);
                        setShowDisconnectModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => handleConnect(platform)}
                  size="md"
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Connect {name}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Disconnect Confirmation Modal */}
      <Modal
        open={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="Disconnect Account"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-surface-300">
            Are you sure you want to disconnect your {selectedConnection?.platform} account?
            This will stop automatic metric syncing for this platform.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowDisconnectModal(false)}
              size="md"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisconnect}
              size="md"
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
