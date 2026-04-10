import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  changedBy: string;
  changedByName: string;
  oldRole: string | null;
  newRole: string | null;
  oldDomainId: string | null;
  oldDomainName: string | null;
  newDomainId: string | null;
  newDomainName: string | null;
  reason: string;
  changedAt: string;
}

const AuditLogPage: React.FC = () => {
  const [logs, setLogs]           = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users/audit-logs')
      .then(r  => setLogs(r.data))
      .catch(e => console.error('Failed to fetch audit logs:', e))
      .finally(() => setIsLoading(false));
  }, []);

  const formatRole = (role: string | null, domain: string | null) => {
    if (!role) return 'None';
    return role === 'DOMAIN_ADMIN' && domain
      ? `${role.replace('_', ' ')} (${domain})`
      : role.replace('_', ' ');
  };

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
        <div className="flex items-center gap-3 mb-1">
          <ShieldAlert size={22} style={{ color: '#7B6BA5' }} />
          <h1
            className="font-serif leading-tight"
            style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
          >
            Security Audit Log
          </h1>
        </div>
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Immutable chronological record of administrative interventions.
        </p>
        <div
          className="mt-5 h-px"
          style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }}
        />
      </header>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid #E2E8DF' }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ background: '#F2F5F0', borderBottom: '1px solid #E2E8DF' }}>
              {['Timestamp', 'Target', 'Action', 'Reason', 'Performed By'].map(h => (
                <TableHead
                  key={h}
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] py-3.5"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-16"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : logs.map(log => (
              <TableRow
                key={log.id}
                style={{ borderBottom: '1px solid #E2E8DF' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F2F5F0')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <TableCell className="py-4 pl-4">
                  <p className="font-mono text-[11px]" style={{ color: '#6B7B6B' }}>
                    {format(new Date(log.changedAt), 'MMM dd, yyyy')}
                  </p>
                  <p
                    className="font-mono text-[10px] mt-0.5"
                    style={{ color: '#6B7B6B', opacity: 0.6 }}
                  >
                    {format(new Date(log.changedAt), 'HH:mm:ss')}
                  </p>
                </TableCell>
                <TableCell className="py-4">
                  <div className="group relative">
                    <p
                      className="text-[13px] font-medium truncate max-w-[180px] cursor-help"
                      style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {log.userEmail}
                    </p>
                    <div
                      className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 text-[10px] py-2 px-3 rounded-md shadow-lg font-mono min-w-[240px] leading-relaxed"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8DF', color: '#1A2E1A' }}
                    >
                      <p>NAME: {log.userName}</p>
                      <p>UUID: {log.userId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                  >
                    Role Update
                  </p>
                  <div className="flex items-center gap-2 text-[12px]">
                    <span
                      style={{
                        color: '#6B7B6B',
                        textDecoration: 'line-through',
                        fontFamily: 'Albert Sans, sans-serif',
                      }}
                    >
                      {formatRole(log.oldRole, log.oldDomainName)}
                    </span>
                    <span style={{ color: '#E2E8DF' }}>&rarr;</span>
                    <span
                      className="font-medium"
                      style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {formatRole(log.newRole, log.newDomainName)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 max-w-xs">
                  <p
                    className="text-[13px] italic truncate"
                    style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                  >
                    &ldquo;{log.reason || 'Manual transition.'}&rdquo;
                  </p>
                </TableCell>
                <TableCell className="py-4 pr-4 text-right">
                  <div className="group relative inline-block">
                    <p
                      className="text-[13px] font-medium cursor-help"
                      style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {log.changedByName}
                    </p>
                    <div
                      className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 text-[10px] py-1 px-2 rounded font-mono"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8DF', color: '#1A2E1A' }}
                    >
                      ID: {log.changedBy}
                    </div>
                  </div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                    style={{ color: '#5B8C5A', fontFamily: 'Albert Sans, sans-serif' }}
                  >
                    Administrator
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditLogPage;
