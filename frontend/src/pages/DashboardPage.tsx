import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            {user?.role === 'SUPER_ADMIN' && (
              <>
                <Link to="/admin/users">
                  <Button variant="secondary">User Management</Button>
                </Link>
                <Link to="/admin/domains">
                  <Button variant="secondary">Domain Management</Button>
                </Link>
              </>
            )}
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.fullName}!</h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role || 'None'}</p>
            <p><strong>Status:</strong> <span className="text-green-600 font-medium">{user?.status}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg bg-blue-50 text-blue-700 font-medium text-center">
            Resources (Module A)
          </div>
          <div className="p-4 border rounded-lg bg-green-50 text-green-700 font-medium text-center">
            Bookings (Module B)
          </div>
          <div className="p-4 border rounded-lg bg-purple-50 text-purple-700 font-medium text-center">
            Tickets (Module C)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
