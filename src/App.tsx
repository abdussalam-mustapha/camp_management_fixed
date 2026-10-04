import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CampaignsPage from './components/campaigns/CampaignsPage';
import CampaignDetailPage from './components/campaigns/CampaignDetailPage';
import CreatorsPage from './components/creators/CreatorsPage';
import CreatorProfilePage from './components/creators/CreatorProfilePage';
import ReportsPage from './components/reports/ReportsPage';
import IntegrationsPage from './components/settings/IntegrationsPage';
import AuthCallbackPage from './components/auth/AuthCallbackPage';

function AppContent() {
  const { state, dispatch } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-surface-100 transition-colors duration-200">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {state.isMobileMenuOpen && (
        <div className="lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => dispatch({ type: 'MOBILE_MENU_TOGGLE' })}
          ></div>
          <div className="fixed top-0 left-0 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          <Routes>
            <Route path="/" element={<Navigate to="/campaigns" replace />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route path="/creators/:id" element={<CreatorProfilePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}