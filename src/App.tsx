import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import TtxScenarios from './pages/TtxScenarios';
import TtxScenarioEdit from './pages/TtxScenarioEdit';
import TtxSessions from './pages/TtxSessions';
import TtxConsole from './pages/TtxConsole';
import TtxAAR from './pages/TtxAAR';
import TtxParticipant from './pages/TtxParticipant';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/kb" element={<KBAdmin />} />
        <Route path="/kb/search" element={<KBSearch />} />
        <Route path="/kb/topics" element={<TopicManager />} />
        <Route path="/kb/modules" element={<ModuleManager />} />
        <Route path="/kb/:id" element={<KBItemDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/progress" element={<AdminProgress />} />
        <Route path="/admin/assignments" element={<AdminAssignments />} />
        <Route path="/learn" element={<LearnHub />} />
        <Route path="/learn/modules/:id" element={<LearnModule />} />
        {/* TTX routes safely isolated prior to AWS launch
        <Route path="/ttx/scenarios" element={<TtxScenarios />} />
        <Route path="/ttx/scenarios/:id" element={<TtxScenarioEdit />} />
        <Route path="/ttx/sessions" element={<TtxSessions />} />
        <Route path="/ttx/sessions/:id" element={<TtxConsole />} />
        <Route path="/ttx/sessions/:id/aar" element={<TtxAAR />} />
        <Route path="/ttx/sessions/:id/participate" element={<TtxParticipant />} />
        */}
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
