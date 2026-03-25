import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavShell from './components/layouts/NavShell';
import { PublicLayout } from './components/PublicLayout';
import { NeuralBackground } from './components/NeuralBackground';
import FreeTierGate from './components/FreeTierGate';
import { useLearnerTier } from './hooks/useLearnerTier';

// Public pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import CapabilitiesPage from './pages/public/CapabilitiesPage';
import EnterprisePage from './pages/public/EnterprisePage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import PackagesPage from './pages/public/PackagesPage';
import RegisterPage from './pages/public/RegisterPage';
import LoginPage from './pages/public/LoginPage';

// App pages
import KBAdmin from './pages/KBAdmin';
import KBItemDetail from './pages/KBItemDetail';
import TopicManager from './pages/TopicManager';
import KBSearch from './pages/KBSearch';
import ModuleManager from './pages/ModuleManager';
import LearnHub from './pages/LearnHub';
import LearnModule from './pages/LearnModule';
import AdminProgress from './pages/AdminProgress';
import AdminAssignments from './pages/AdminAssignments';
import AdminLogin from './pages/AdminLogin';
import AdminProfile from './pages/AdminProfile';
import AdminDashboard from './pages/AdminDashboard';
import LearnDashboard from './pages/LearnDashboard';
import LearnLibrary from './pages/LearnLibrary';
import LearnLibraryTopic from './pages/LearnLibraryTopic';
import LearnScorecard from './pages/LearnScorecard';
import LearnTTX from './pages/LearnTTX';
import SecurityGame from './game/SecurityGame';
import ChatAssistant from './components/ChatAssistant';

// TTX restored for staging validation
import TtxScenarios from './pages/TtxScenarios';
import TtxScenarioEdit from './pages/TtxScenarioEdit';
import TtxSessions from './pages/TtxSessions';
import TtxConduct from './pages/TtxConduct';
import TtxAAR from './pages/TtxAAR';
import TtxParticipate from './pages/TtxParticipate';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public marketing site ── */}
        <Route element={<PublicWrapper />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/capabilities" element={<CapabilitiesPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsPage />} />
          <Route path="/packages" element={<PackagesPage />} />
        </Route>

        {/* ── Auth pages (public, no nav) ── */}
        <Route element={<PublicWrapper minimal />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ── Admin login (standalone) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Protected app routes with NavShell ── */}
        <Route element={<NavWrapper />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/progress" element={<AdminProgress />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />

          <Route path="/kb" element={<KBAdmin />} />
          <Route path="/kb/search" element={<KBSearch />} />
          <Route path="/kb/topics" element={<TopicManager />} />
          <Route path="/kb/modules" element={<ModuleManager />} />
          <Route path="/kb/:id" element={<KBItemDetail />} />

          <Route path="/learn/dashboard" element={<LearnDashboard />} />
          <Route path="/learn" element={<LearnHub />} />
          <Route path="/learn/modules/:id" element={<LearnModule />} />
          <Route path="/learn/library" element={<LearnLibrary />} />
          <Route path="/learn/library/:topicId" element={<LearnLibraryTopic />} />
          <Route path="/learn/scorecard" element={<LearnScorecard />} />
          <Route path="/learn/ttx" element={<LearnTTX />} />
          <Route path="/learn/game" element={<SecurityGame />} />

          {/* TTX routes */}
          <Route path="/ttx/scenarios" element={<TtxScenarios />} />
          <Route path="/ttx/scenarios/:id" element={<TtxScenarioEdit />} />
          <Route path="/ttx/sessions" element={<TtxSessions />} />
          <Route path="/ttx/sessions/:id/aar" element={<TtxAAR />} />
        </Route>

        {/* ── Full-screen TTX apps (no shell) ── */}
        <Route path="/ttx/sessions/:id/conduct" element={<TtxConduct />} />
        <Route path="/ttx/sessions/:id/participate" element={<TtxParticipate />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { Outlet } from 'react-router-dom';

function PublicWrapper({ minimal }: { minimal?: boolean }) {
  if (minimal) {
    // Auth pages: NeuralBackground canvas only, no nav/footer
    return (
      <div className="min-h-screen relative" style={{ background: 'var(--bg-canvas)' }}>
        <NeuralBackground />
        <div className="relative z-10">
          <Outlet />
        </div>
      </div>
    );
  }
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}

function NavWrapper() {
  const { tier, loading, refresh } = useLearnerTier();

  if (loading) {
    return (
      <NavShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border-gold)', borderTopColor: 'var(--gold-accent)' }} />
        </div>
      </NavShell>
    );
  }

  if (tier === 'free') {
    return (
      <NavShell>
        <FreeTierGate onCheckAccess={refresh} />
      </NavShell>
    );
  }

  return (
    <>
      <NavShell>
        <Outlet />
      </NavShell>
      <ChatAssistant />
    </>
  );
}

