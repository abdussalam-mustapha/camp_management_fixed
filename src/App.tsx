import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CampaignsPage from './components/campaigns/CampaignsPage';
import CampaignDetailPage from './components/campaigns/CampaignDetailPage';
import CreatorsPage from './components/creators/CreatorsPage';
import CreatorProfilePage from './components/creators/CreatorProfilePage';
import ReportsPage from './components/reports/ReportsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-surface-100 transition-colors duration-200">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
              <Routes>
                <Route path="/" element={<Navigate to="/campaign-influencer" replace />} />
                <Route path="/campaign-influencer" element={<CampaignsPage />} />
                <Route path="/campaign-influencer/:id" element={<CampaignDetailPage />} />
                <Route path="/creators" element={<CreatorsPage />} />
                <Route path="/creators/:id" element={<CreatorProfilePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:id" element={<ReportsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}