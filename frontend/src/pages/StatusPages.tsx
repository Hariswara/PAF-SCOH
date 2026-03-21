import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export const PendingActivationPage: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl text-center border">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Account Pending Activation</h1>
        <p className="text-gray-600 mb-8">
          Your account has been registered and is currently waiting for a Super Admin to assign your role.
          You will be able to access the system once activation is complete.
        </p>
        <Button variant="outline" onClick={logout}>Back to Login</Button>
      </div>
    </div>
  );
};

export const SuspendedPage: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl text-center border border-red-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h1>
        <p className="text-gray-600 mb-8">
          Your account has been suspended by an administrator. Please contact support if you believe this is an error.
        </p>
        <Button variant="destructive" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
};

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl text-center border">
        <h1 className="text-2xl font-bold text-orange-600 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-8">
          You do not have the required permissions to view this page.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
      </div>
    </div>
  );
};
