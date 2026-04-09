import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard, GuestGuard } from '@/components/auth/AuthGuard';

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

//tickets
import TicketListPage from '@/pages/tickets/TicketListPage';
import CreateTicketPage from '@/pages/tickets/CreateTicketPage';
import TicketDetailPage from '@/pages/tickets/TicketDetailPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Guest Routes */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />

          {/* Status Pages */}
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

          {/* Registration Flow */}
          <Route
            path="/register"
            element={
              <AuthGuard>
                <RegisterPage />
              </AuthGuard>
            }
          />

          {/* Core App Routes (Available to all ACTIVE users) */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="/bookings"
            element={
              <AuthGuard>
                <BookingsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/resources"
            element={
              <AuthGuard>
                <ResourcesPage />
              </AuthGuard>
            }
          />

          {/* Admin Specific Routes */}
          <Route
            path="/admin/users"
            element={
              <AuthGuard allowedRoles={['SUPER_ADMIN']}>
                <UserManagementPage />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/domains"
            element={
              <AuthGuard allowedRoles={['SUPER_ADMIN']}>
                <DomainManagementPage />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <AuthGuard allowedRoles={['SUPER_ADMIN']}>
                <AuditLogPage />
              </AuthGuard>
            }
          />

          {/* Ticket Routes */}
          <Route
            path="/tickets"
            element={
              <AuthGuard>
                <TicketListPage />
              </AuthGuard>
            }
          />

          <Route
            path="/tickets/new"
            element={
              <AuthGuard>
                <CreateTicketPage />
              </AuthGuard>
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <AuthGuard>
                <TicketDetailPage />
              </AuthGuard>
            }
          />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
