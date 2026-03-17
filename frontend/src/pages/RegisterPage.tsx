import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const RegisterPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const [step, setStep] = useState<'fork' | 'student' | 'non-student'>('fork');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    studentId: '',
    department: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = step === 'student' ? '/auth/register/student' : '/auth/register/non-student';
      await api.post(endpoint, formData);
      await checkAuth(); // Refresh user state to trigger redirect via AuthGuard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'fork') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full border p-8 rounded-lg shadow-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p>Are you a student of the university?</p>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => setStep('student')}>Yes, I am a Student</Button>
            <Button variant="outline" className="flex-1" onClick={() => setStep('non-student')}>No, I am Staff/Admin</Button>
          </div>
          <Button variant="ghost" onClick={logout}>Cancel & Logout</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full border p-8 rounded-lg shadow-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {step === 'student' ? 'Student Registration' : 'Staff Registration'}
        </h1>
        
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm border border-red-200 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          {step === 'student' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} required placeholder="e.g. IT21001234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleChange} required placeholder="e.g. Computing" />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={() => setStep('fork')} disabled={isSubmitting}>Back</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
