import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/admin/users/audit-logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatRole = (role: string | null, domainName: string | null) => {
    if (!role) return 'None';
    if (role === 'DOMAIN_ADMIN' && domainName) {
      return `${role.replace('_', ' ')} (${domainName})`;
    }
    return role.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      <header className="bg-primary text-primary-foreground py-8 px-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/admin/users" className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors flex items-center mb-4">
            <span className="mr-2">←</span> Return to Directory
          </Link>
          <h1 className="text-4xl font-serif mb-2">Security Audit Log</h1>
          <p className="text-primary-foreground/70 font-light max-w-xl text-sm">
            Immutable chronological record of administrative interventions.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8">
        <div className="bg-card border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4 pl-6">Timestamp</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Target (Email)</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Action</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Reason / Notes</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4 text-right pr-6">Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-light">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-5 pl-6">
                      <p className="text-xs font-mono text-muted-foreground">
                        {format(new Date(log.changedAt), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/60">
                        {format(new Date(log.changedAt), 'HH:mm:ss')}
                      </p>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="group relative">
                        <p className="text-sm font-bold text-primary truncate max-w-[180px] cursor-help">
                          {log.userEmail}
                        </p>
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-primary text-primary-foreground text-[10px] py-2 px-3 rounded shadow-lg font-mono min-w-[240px] leading-relaxed">
                          <p>NAME: {log.userName}</p>
                          <p>UUID: {log.userId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">Role Update</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-muted-foreground line-through decoration-muted-foreground/50">
                            {formatRole(log.oldRole, log.oldDomainName)}
                          </span>
                          <span className="text-secondary">→</span>
                          <span className="font-bold text-primary">
                            {formatRole(log.newRole, log.newDomainName)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 max-w-xs">
                      <p className="text-sm text-muted-foreground italic font-light truncate">
                        "{log.reason || 'Manual transition.'}"
                      </p>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-6">
                      <div className="group relative">
                        <p className="text-xs font-bold text-primary cursor-help">
                          {log.changedByName}
                        </p>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 bg-primary text-primary-foreground text-[10px] py-1 px-2 rounded shadow-lg font-mono">
                          ID: {log.changedBy}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mt-1">Administrator</p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AuditLogPage;
