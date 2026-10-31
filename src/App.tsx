import React, { useState, useEffect } from 'react';
import { AuthProvider } from './lib/authStore';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { PublicExplorerPage } from './pages/PublicExplorerPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CivicAnalyticsPage } from './pages/CivicAnalyticsPage';
import { AboutPage } from './pages/AboutPage';
import { AuthPage } from './pages/AuthPage';
import { QueriesPage } from './pages/QueriesPage';
import { Report } from './types';
import { ReportService } from './lib/reportStore';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Check URL hash on initial load (e.g. #issue-CVL-2026-8812)
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#issue-')) {
        const refCode = hash.replace('#issue-', '');
        const found = await ReportService.getReportByReference(refCode);
        if (found) {
          setSelectedReport(found);
          setCurrentTab('details');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (tab: string, report?: Report) => {
    if (tab === 'details' && report) {
      setSelectedReport(report);
      setCurrentTab('details');
      window.location.hash = `issue-${report.reference_code}`;
    } else {
      setCurrentTab(tab);
      if (tab !== 'details') {
        window.location.hash = '';
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F8] text-slate-900 font-sans antialiased selection:bg-[#442646] selection:text-white">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={(tab, rep) => handleNavigate(tab, rep)}
          />
        )}

        {currentTab === 'explorer' && (
          <PublicExplorerPage
            onSelectReport={(r) => handleNavigate('details', r)}
            onNavigateToReport={() => handleNavigate('report')}
          />
        )}

        {currentTab === 'report' && (
          <ReportIssuePage
            onSuccess={(r) => handleNavigate('details', r)}
            onCancel={() => handleNavigate('explorer')}
          />
        )}

        {currentTab === 'details' && selectedReport && (
          <IssueDetailsPage
            report={selectedReport}
            onBack={() => handleNavigate('explorer')}
            onReportUpdated={(updated) => setSelectedReport(updated)}
          />
        )}

        {currentTab === 'citizen-dashboard' && (
          <CitizenDashboard
            onSelectReport={(r) => handleNavigate('details', r)}
            onNavigateToReport={() => handleNavigate('report')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            onSelectReport={(r) => handleNavigate('details', r)}
          />
        )}

        {currentTab === 'analytics' && <CivicAnalyticsPage />}

        {currentTab === 'about' && <AboutPage />}

        {currentTab === 'queries' && <QueriesPage />}

        {currentTab === 'auth' && (
          <AuthPage onSuccess={() => handleNavigate('citizen-dashboard')} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

