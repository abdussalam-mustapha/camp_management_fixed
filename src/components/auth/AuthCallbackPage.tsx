import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { apiService } from '../../utils/api';
import type { Platform } from '../../data/types';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useApp();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const urlPlatform = searchParams.get('platform');
      const platform = urlPlatform === 'twitter' ? 'x' : urlPlatform;
      const success = searchParams.get('success') === 'true';
      const userId = searchParams.get('userId');

      if (!platform || !success) {
        setStatus('error');
        setMessage('Authentication failed or was cancelled');
        setTimeout(() => navigate('/integrations'), 3000);
        return;
      }

      try {
        setStatus('loading');
        setMessage(`Connecting to ${platform}...`);

        // Load the connected accounts to get the new connection
        const connections = await apiService.getConnectedAccounts();
        const newConnection = connections.find(c => c.platform === platform && c.platformUserId === userId);

        if (newConnection) {
          dispatch({
            type: 'PLATFORM_CONNECTION_ADD',
            payload: {
              id: `${platform}_${userId}`,
              platform: platform as Platform,
              platformUserId: userId!,
              platformUsername: newConnection.profileData.username || newConnection.profileData.name || 'Unknown',
              profileData: newConnection.profileData,
              connectedAt: newConnection.connectedAt,
              lastSyncAt: new Date().toISOString(),
              isActive: true
            }
          });

          setStatus('success');
          setMessage(`Successfully connected to ${platform}!`);
          setTimeout(() => navigate('/integrations'), 2000);
        } else {
          setStatus('error');
          setMessage('Connection data not found');
          setTimeout(() => navigate('/integrations'), 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to complete connection');
        setTimeout(() => navigate('/integrations'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-surface-950">
      <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-surface-800/80 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="animate-spin text-brand-600 dark:text-brand-400" size={48} />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Connecting Account
                </h2>
                <p className="text-slate-600 dark:text-surface-300">{message}</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={48} />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Connection Successful
                </h2>
                <p className="text-slate-600 dark:text-surface-300">{message}</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="text-rose-600 dark:text-rose-400" size={48} />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Connection Failed
                </h2>
                <p className="text-slate-600 dark:text-surface-300">{message}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
