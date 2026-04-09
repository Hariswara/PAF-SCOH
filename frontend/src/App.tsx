import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard, GuestGuard } from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import RegisterPage from '@/pages/RegisterPage';
import { PendingActivationPage, SuspendedPage, UnauthorizedPage } from '@/pages/StatusPages';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import DomainManagementPage from '@/pages/admin/DomainManagementPage';
import AuditLogPage from '@/pages/admin/AuditLogPage';
import BookingsPage from '@/pages/BookingsPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ProfilePage from '@/pages/ProfilePage';

// Tickets
import TicketListPage from '@/pages/tickets/TicketListPage';
import CreateTicketPage from '@/pages/tickets/CreateTicketPage';
import TicketDetailPage from '@/pages/tickets/TicketDetailPage';

/** Wraps a page with AuthGuard + the shared sidebar layout */
function ProtectedPage({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public / Guest ── */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />

          {/* ── Status pages (standalone, no sidebar) ── */}
          <Route path="/suspended" element={<SuspendedPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/pending-activation"
            element={
              <AuthGuard>
                <PendingActivationPage />
              </AuthGuard>
            }
          />

          {/* ── Registration flow (standalone) ── */}
          <Route
            path="/register"
            element={
              <AuthGuard>
                <RegisterPage />
              </AuthGuard>
            }
          />

          {/* ── Core app (sidebar layout) ── */}
          <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
          <Route path="/bookings" element={<ProtectedPage><BookingsPage /></ProtectedPage>} />
          <Route path="/resources" element={<ProtectedPage><ResourcesPage /></ProtectedPage>} />
          <Route path="/profile" element={<ProtectedPage><ProfilePage /></ProtectedPage>} />

          {/* ── Tickets ── */}
          <Route path="/tickets" element={<ProtectedPage><TicketListPage /></ProtectedPage>} />
          <Route path="/tickets/new" element={<ProtectedPage><CreateTicketPage /></ProtectedPage>} />
          <Route path="/tickets/:id" element={<ProtectedPage><TicketDetailPage /></ProtectedPage>} />

          {/* ── Admin (sidebar layout) ── */}
          <Route path="/admin/users" element={<ProtectedPage allowedRoles={['SUPER_ADMIN']}><UserManagementPage /></ProtectedPage>} />
          <Route path="/admin/domains" element={<ProtectedPage allowedRoles={['SUPER_ADMIN']}><DomainManagementPage /></ProtectedPage>} />
          <Route path="/admin/audit" element={<ProtectedPage allowedRoles={['SUPER_ADMIN']}><AuditLogPage /></ProtectedPage>} />

          {/* ── Redirects ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
