import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import PasskeyPrompt from '@/components/auth/PasskeyPrompt';

const GENDER_OPTIONS = [
  { value: 'MALE',              label: 'Male' },
  { value: 'FEMALE',            label: 'Female' },
  { value: 'OTHER',             label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const fieldLabel = 'text-xs uppercase tracking-wider text-muted-foreground font-semibold';
const fieldInput = 'h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-lg';
const fieldInputPlaceholder = `${fieldInput} placeholder:text-muted-foreground/30 placeholder:font-light`;

const RegisterPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const [step, setStep] = useState<'fork' | 'student' | 'non-student'>('fork');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    studentId: '',
    department: '',
    phoneCode: '+94',
    phoneNumber: '',
    contactEmail: '',
    gender: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostRegisterNav = async () => {
    setShowPasskeyPrompt(false);
    await checkAuth();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const phone = formData.phoneNumber.trim()
        ? `${formData.phoneCode} ${formData.phoneNumber.replace(/[^\d\s-]/g, '').trim()}`
        : null;

      const endpoint = step === 'student' ? '/auth/register/student' : '/auth/register/non-student';

      const base = {
        fullName: formData.fullName,
        phone: phone || null,
        contactEmail: formData.contactEmail || null,
        gender: formData.gender || null,
      };

      const payload = step === 'student'
        ? { ...base, studentId: formData.studentId, department: formData.department }
        : { ...base, department: formData.department || null };

      await api.post(endpoint, payload);
      setShowPasskeyPrompt(true);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      const serverMessage = anyErr.response?.data?.message;
      const validationErrors = anyErr.response?.data?.errors;

      if (validationErrors && typeof validationErrors === 'object') {
        const errorList = Object.entries(validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        setError(`Validation failed: ${errorList}`);
      } else {
        setError(serverMessage || 'Registration failed. Please verify your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPasskeyPrompt) {
    return <PasskeyPrompt onComplete={handlePostRegisterNav} />;
  }

  /* ─── Fork screen ─── */
  if (step === 'fork') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(circle, rgba(45,122,58,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="max-w-3xl w-full relative z-10 flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-3">Welcome to SCOH</h2>
            <h1 className="text-4xl md:text-5xl font-serif text-primary">Select Your Designation</h1>
            <p className="mt-4 text-muted-foreground font-light max-w-lg mx-auto">
              To properly configure your workspace and permissions, please indicate your primary role within the university.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
            <button
              onClick={() => setStep('student')}
              className="group text-left p-8 bg-card border border-border hover:border-secondary transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center mb-6 shadow-md">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-primary font-bold mb-2">Student</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Access course materials, book campus facilities, and manage your academic schedule.
                </p>
                <div className="mt-6 flex items-center text-secondary text-sm font-medium tracking-wide">
                  CONTINUE <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setStep('non-student')}
              className="group text-left p-8 bg-card border border-border hover:border-primary transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-secondary text-white flex items-center justify-center mb-6 shadow-md">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-primary font-bold mb-2">Staff / Administrator</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Manage domains, review reports, assist students, and oversee campus operations.
                </p>
                <div className="mt-6 flex items-center text-primary text-sm font-medium tracking-wide">
                  CONTINUE <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </button>
          </div>

          <button onClick={logout} className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline tracking-widest uppercase">
            Cancel &amp; Return to Login
          </button>
        </div>
      </div>
    );
  }

  /* ─── Registration form ─── */
  const isStudent = step === 'student';

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 relative">
      <div className="max-w-xl w-full bg-card border border-border shadow-xl p-10 sm:p-14 relative z-10">

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-border">
          <h2 className="text-secondary font-bold tracking-widest uppercase text-xs mb-2">Profile Configuration</h2>
          <h1 className="text-3xl font-serif text-primary">
            {isStudent ? 'Student Registration' : 'Staff Registration'}
          </h1>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/5 border-l-4 border-destructive text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Full Name — always */}
          <div className="space-y-3">
            <Label htmlFor="fullName" className={fieldLabel}>Official Full Name</Label>
            <Input
              id="fullName" name="fullName" required
              value={formData.fullName} onChange={handleChange}
              className={fieldInput}
            />
          </div>

          {/* Student-only: ID + Department (required) */}
          {isStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="studentId" className={fieldLabel}>University ID</Label>
                <Input
                  id="studentId" name="studentId" required
                  value={formData.studentId} onChange={handleChange}
                  placeholder="e.g. IT21001234"
                  className={fieldInputPlaceholder}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="department" className={fieldLabel}>Department</Label>
                <Input
                  id="department" name="department" required
                  value={formData.department} onChange={handleChange}
                  placeholder="e.g. Computing"
                  className={fieldInputPlaceholder}
                />
              </div>
            </div>
          )}

          {/* Staff-only: Department (optional) */}
          {!isStudent && (
            <div className="space-y-3">
              <Label htmlFor="department" className={fieldLabel}>Department (Optional)</Label>
              <Input
                id="department" name="department"
                value={formData.department} onChange={handleChange}
                placeholder="e.g. Administration"
                className={fieldInputPlaceholder}
              />
            </div>
          )}

          {/* Phone with country code */}
          <div className="space-y-3">
            <Label className={fieldLabel}>Contact Number (Optional)</Label>
            <div className="flex gap-3 items-end">
              <Input
                value={formData.phoneCode}
                onChange={e => {
                  let v = e.target.value;
                  if (v && !v.startsWith('+')) v = '+' + v;
                  setFormData({ ...formData, phoneCode: v });
                }}
                maxLength={5}
                className={`${fieldInput} w-[70px] shrink-0 text-center`}
              />
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^\d\s-]/g, '') })}
                placeholder="77 123 4567"
                className={`${fieldInputPlaceholder} flex-1`}
              />
            </div>
          </div>

          {/* Contact Email + Gender row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="contactEmail" className={fieldLabel}>Contact Email (Optional)</Label>
              <Input
                id="contactEmail" name="contactEmail" type="email"
                value={formData.contactEmail} onChange={handleChange}
                placeholder="personal@email.com"
                className={fieldInputPlaceholder}
              />
              <p className="text-[11px] text-muted-foreground/60 font-light">
                An alternate email besides your Google account.
              </p>
            </div>
            <div className="space-y-3">
              <Label className={fieldLabel}>Gender (Optional)</Label>
              <Select value={formData.gender} onValueChange={val => setFormData({ ...formData, gender: val })}>
                <SelectTrigger className="h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus:ring-0 focus:border-primary px-0 text-lg">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-8">
            <button
              type="button"
              onClick={() => setStep('fork')}
              disabled={isSubmitting}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium flex items-center"
            >
              <span className="mr-2">&larr;</span> Back
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold tracking-wider uppercase"
            >
              {isSubmitting ? 'Processing...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
