import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard, GuestGuard } from '@/components/auth/AuthGuard';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import RegisterPage from '@/pages/RegisterPage';
import { PendingActivationPage, SuspendedPage, UnauthorizedPage } from '@/pages/StatusPages';
import UserManagementPage from '@/pages/admin/UserManagementPage';

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

          {/* Status Pages (Protected but accessible by specific states) */}
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

          {/* Authenticated Functional Routes */}
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/users" 
            element={
              <AuthGuard allowedRoles={['SUPER_ADMIN']}>
                <UserManagementPage />
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
