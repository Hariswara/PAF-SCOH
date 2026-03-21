import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User, UserRole, UserStatus } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Domain {
  id: string;
  name: string;
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

  if (isLoading) return <div className="p-8 text-center">Loading management console...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell className="text-gray-600">{u.email}</TableCell>
                <TableCell>
                  <Select 
                    disabled={u.role === 'SUPER_ADMIN'}
                    onValueChange={(val) => handleRoleChange(u.id, val as UserRole, u.domainId)}
                    defaultValue={u.role || ''}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TECHNICIAN">Technician</SelectItem>
                      <SelectItem value="DOMAIN_ADMIN">Domain Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {u.role === 'DOMAIN_ADMIN' ? (
                    <Select 
                      onValueChange={(val) => handleRoleChange(u.id, u.role!, val)}
                      defaultValue={u.domainId || ''}
                    >
                      <SelectTrigger className="w-48 text-sm">
                        <SelectValue placeholder="Select Campus Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.filter(d => d.id).map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : <span className="text-gray-400">N/A</span>}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                    u.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                  }`}>
                    {u.status}
                  </span>
                </TableCell>
                <TableCell>
                  {u.role !== 'SUPER_ADMIN' && (
                    <Button 
                      variant={u.status === 'SUSPENDED' ? 'outline' : 'destructive'} 
                      size="sm"
                      onClick={() => handleStatusToggle(u.id, u.status)}
                    >
                      {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementPage;
