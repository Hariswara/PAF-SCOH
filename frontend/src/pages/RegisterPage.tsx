import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const RegisterPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white p-10 shadow-lg text-center border">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-gray-600">Welcome, {user?.fullName}! Just a few more steps to get started.</p>
        
        <div className="py-10 border-2 border-dashed rounded-lg bg-yellow-50 text-yellow-800">
          <p className="font-medium text-lg">Registration Forms Coming in Auth-05</p>
          <p className="text-sm mt-2">Currently in PENDING_PROFILE status</p>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={logout} className="flex-1">Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
