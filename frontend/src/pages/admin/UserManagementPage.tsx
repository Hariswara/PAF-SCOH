import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User, UserRole, UserStatus } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface Domain {
  id: string;
  name: string;
  isActive: boolean;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, domainsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/domains')
      ]);
      setUsers(usersRes.data);
      setDomains(domainsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole, domainId?: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { 
        newRole, 
        domainId,
        reason: 'Administrative promotion' 
      });
      fetchData();
    } catch (error) {
      alert('Failed to update role. Note: Domain Admin requires a domain selection.');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await api.put(`/admin/users/${userId}/status?status=${newStatus}`);
      fetchData();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-8 mb-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-4">
            <Link to="/dashboard" className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors flex items-center">
              <span className="mr-2">←</span> Return to Dashboard
            </Link>
            <Link to="/admin/audit" className="text-xs font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-4 py-2 border border-white/20 transition-all rounded-sm">
              View Security Audit Logs
            </Link>
          </div>
          <h1 className="text-4xl font-serif mb-2">Personnel Directory</h1>
          <p className="text-primary-foreground/70 font-light max-w-xl text-sm">
            Review university members, assign administrative privileges, and manage account statuses.
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-8 space-y-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-serif text-primary border-l-4 border-primary pl-4 mb-2">Registered Members</h2>
            <p className="text-sm text-muted-foreground font-light">Comprehensive list of students, staff, and administrators.</p>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Total Records: <span className="text-primary font-bold">{users.length}</span>
          </div>
        </div>

        <div className="border border-border bg-card shadow-sm overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4 pl-6">Member Details</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Designation</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Assigned Unit</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Access Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {users.map((u) => (
                <TableRow key={u.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="py-5 pl-6">
                    <p className="font-serif text-lg text-primary font-bold">{u.fullName}</p>
                    <p className="text-muted-foreground font-light text-sm">{u.email}</p>
                  </TableCell>
                  <TableCell className="py-5">
                    <Select 
                      disabled={u.role === 'SUPER_ADMIN'}
                      onValueChange={(val) => handleRoleChange(u.id, val as UserRole, u.domainId)}
                      defaultValue={u.role || ''}
                    >
                      <SelectTrigger className="w-44 bg-transparent border-border focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Assign Designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="TECHNICIAN">Technician</SelectItem>
                        <SelectItem value="DOMAIN_ADMIN">Domain Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-5">
                    {u.role === 'DOMAIN_ADMIN' ? (
                      <Select 
                        onValueChange={(val) => handleRoleChange(u.id, u.role!, val)}
                        defaultValue={u.domainId || ''}
                      >
                        <SelectTrigger className="w-56 text-sm bg-transparent border-border focus:ring-primary focus:border-primary">
                          <SelectValue placeholder="Select Campus Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.filter(d => d.isActive).map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground/40 text-sm font-light italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${
                      u.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 
                      u.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {u.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-5 pr-6">
                    {u.role !== 'SUPER_ADMIN' ? (
                      <button 
                        onClick={() => handleStatusToggle(u.id, u.status)}
                        className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                          u.status === 'SUSPENDED' ? 'text-primary hover:text-secondary' : 'text-destructive hover:text-destructive/70'
                        }`}
                      >
                        {u.status === 'SUSPENDED' ? 'Restore Access' : 'Revoke Access'}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs font-bold uppercase tracking-widest">Protected</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default UserManagementPage;
