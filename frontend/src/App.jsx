import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PortalAuthProvider, usePortalAuth } from "./context/PortalAuthContext";
import AppLayout from "./components/Layout/AppLayout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import CreateAgency from "./pages/Onboarding/CreateAgency";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Team from "./pages/Team";
import ProjectDetail from "./pages/ProjectDetail";
import TaskDetail from "./pages/TaskDetail";
import PortalLogin from "./pages/Portal/PortalLogin";
import PortalHome from "./pages/Portal/PortalHome";
import PortalProject from "./pages/Portal/PortalProject";

function BootScreen() {
  return (
    <div className="grid h-screen place-items-center bg-bone-50">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <span className="grid size-12 animate-pulse place-items-center rounded-2xl bg-ink-900">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
            <circle cx="14" cy="16" r="7" fill="none" stroke="#C4633F" strokeWidth="3" />
            <circle cx="24" cy="16" r="3" fill="#FAF9F5" />
          </svg>
        </span>
        <span className="font-display text-sm italic text-ink-400">Creator OS</span>
      </div>
    </div>
  );
}

function RequireStaff({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.agencyId) return <Navigate to="/onboarding" replace />;
  return children;
}

function RequireOnboarding({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.agencyId) return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (user) return <Navigate to={user.agencyId ? "/" : "/onboarding"} replace />;
  return children;
}

function RequireClient({ children }) {
  const { client, booting } = usePortalAuth();
  if (booting) return <BootScreen />;
  if (!client) return <Navigate to="/portal/login" replace />;
  return children;
}

function PortalRoutes() {
  return (
    <PortalAuthProvider>
      <Routes>
        <Route path="login" element={<PortalLogin />} />
        <Route
          index
          element={
            <RequireClient>
              <PortalHome />
            </RequireClient>
          }
        />
        <Route
          path="projects/:projectId"
          element={
            <RequireClient>
              <PortalProject />
            </RequireClient>
          }
        />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </PortalAuthProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/onboarding" element={<RequireOnboarding><CreateAgency /></RequireOnboarding>} />

        <Route path="/portal/*" element={<PortalRoutes />} />

        <Route element={<RequireStaff><AppLayout /></RequireStaff>}>
          <Route index element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/team" element={<Team />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
