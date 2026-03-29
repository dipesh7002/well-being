import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { RoleRoute } from "./components/layout/RoleRoute";
import { LoadingScreen } from "./components/common/LoadingScreen";

const LandingPage = lazy(() => import("./pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("./pages/SignupPage").then((module) => ({ default: module.SignupPage })));
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const JournalEditorPage = lazy(() =>
  import("./pages/JournalEditorPage").then((module) => ({ default: module.JournalEditorPage }))
);
const JournalHistoryPage = lazy(() =>
  import("./pages/JournalHistoryPage").then((module) => ({ default: module.JournalHistoryPage }))
);
const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage }))
);
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage }))
);
const HelperDashboardPage = lazy(() =>
  import("./pages/HelperDashboardPage").then((module) => ({ default: module.HelperDashboardPage }))
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

function App() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/app/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/app/dashboard" replace /> : <SignupPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="journal/new" element={<JournalEditorPage />} />
          <Route path="journal/:id/edit" element={<JournalEditorPage />} />
          <Route path="history" element={<JournalHistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="admin"
            element={
              <RoleRoute roles={["admin"]}>
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="helper"
            element={
              <RoleRoute roles={["helper"]}>
                <HelperDashboardPage />
              </RoleRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
