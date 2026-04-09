import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User, UserRole, UserStatus } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';

interface Domain { id: string; name: string; isActive: boolean; }

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  ACTIVE:             { color: '#2D7A3A', bg: 'rgba(45,122,58,0.08)'  },
  SUSPENDED:          { color: '#D94444', bg: 'rgba(217,68,68,0.08)' },
  PENDING_ACTIVATION: { color: '#D4A017', bg: 'rgba(212,160,23,0.08)' },
  PENDING_PROFILE:    { color: '#D4A017', bg: 'rgba(212,160,23,0.08)' },
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers]       = useState<User[]>([]);
  const [domains, setDomains]   = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [uR, dR] = await Promise.all([api.get('/admin/users'), api.get('/domains')]);
      setUsers(uR.data);
      setDomains(dR.data);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole, domainId?: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { newRole, domainId, reason: 'Administrative promotion' });
      fetchData();
    } catch {
      alert('Failed to update role. Note: Domain Admin requires a domain selection.');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await api.put(`/admin/users/${userId}/status?status=${newStatus}`);
      fetchData();
    } catch {
      alert('Failed to update user status');
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-[3px] animate-spin"
          style={{ borderColor: '#2D7A3A', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto page-enter">

      {/* Back */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 mb-6 group"
        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#1A2E1A] transition-colors">
          Dashboard
        </span>
      </Link>

      {/* Header */}
      <header className="mb-8">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
          style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Administration
        </p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Users size={22} style={{ color: '#2D7A3A' }} />
            <h1
              className="font-serif leading-tight"
              style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
            >
              Personnel Directory
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p
              className="text-[13px]"
              style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
              Total Records:{' '}
              <span style={{ color: '#2D7A3A', fontWeight: 600 }}>{users.length}</span>
            </p>
            <Link
              to="/admin/audit"
              className="text-[12px] font-semibold px-3.5 py-2 rounded-md transition-all"
              style={{
                background: '#F2F5F0',
                border: '1px solid #E2E8DF',
                color: '#7B6BA5',
                fontFamily: 'Albert Sans, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(123,107,165,0.4)';
                e.currentTarget.style.background  = 'rgba(123,107,165,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8DF';
                e.currentTarget.style.background  = '#F2F5F0';
              }}
            >
              View Audit Logs
            </Link>
          </div>
        </div>
        <p
          className="text-[14px] leading-relaxed mt-1"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Review university members, assign administrative privileges, and manage account statuses.
        </p>
        <div
          className="mt-5 h-px"
          style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }}
        />
      </header>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden overflow-x-auto"
        style={{ border: '1px solid #E2E8DF' }}
      >
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow style={{ background: '#F2F5F0', borderBottom: '1px solid #E2E8DF' }}>
              {['Member', 'Designation', 'Assigned Unit', 'Access Status', ''].map(h => (
                <TableHead
                  key={h}
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] py-3.5 ${h === '' ? 'text-right pr-4' : ''}`}
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => {
              const sm = STATUS_STYLE[u.status] ?? { color: '#6B7B6B', bg: '#F2F5F0' };
              return (
                <TableRow
                  key={u.id}
                  style={{ borderBottom: '1px solid #E2E8DF' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F2F5F0')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <TableCell className="py-4 pl-4">
                    <p className="font-serif text-[16px]" style={{ color: '#1A2E1A' }}>
                      {u.fullName}
                    </p>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {u.email}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <Select
                      disabled={u.role === 'SUPER_ADMIN'}
                      onValueChange={val => handleRoleChange(u.id, val as UserRole, u.domainId)}
                      defaultValue={u.role || ''}
                    >
                      <SelectTrigger
                        className="w-44"
                        style={{
                          background: '#F2F5F0',
                          border: '1px solid #E2E8DF',
                          color: '#1A2E1A',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        <SelectValue placeholder="Assign role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="TECHNICIAN">Technician</SelectItem>
                        <SelectItem value="DOMAIN_ADMIN">Domain Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-4">
                    {u.role === 'DOMAIN_ADMIN' ? (
                      <Select
                        onValueChange={val => handleRoleChange(u.id, u.role!, val)}
                        defaultValue={u.domainId || ''}
                      >
                        <SelectTrigger
                          className="w-56"
                          style={{
                            background: '#F2F5F0',
                            border: '1px solid #E2E8DF',
                            color: '#1A2E1A',
                            fontFamily: 'Albert Sans, sans-serif',
                          }}
                        >
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.filter(d => d.isActive).map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span style={{ color: '#B8C4B3', fontFamily: 'Albert Sans, sans-serif' }}>&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                      style={{ background: sm.bg, color: sm.color, fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {u.status.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-4">
                    {u.role !== 'SUPER_ADMIN' ? (
                      <button
                        onClick={() => handleStatusToggle(u.id, u.status)}
                        className="text-[12px] font-semibold uppercase tracking-wider transition-colors"
                        style={{
                          color: u.status === 'SUSPENDED' ? '#2D7A3A' : '#D94444',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        {u.status === 'SUSPENDED' ? 'Restore Access' : 'Revoke Access'}
                      </button>
                    ) : (
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: '#B8C4B3', fontFamily: 'Albert Sans, sans-serif' }}
                      >
                        Protected
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementPage;
