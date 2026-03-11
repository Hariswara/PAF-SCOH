import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User, UserRole, UserStatus } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Simplification: In a real app, we'd open a modal for domainId/reason
      // For this logic-focused task, we'll promote directly.
      await api.put(`/admin/users/${userId}/role`, { 
        newRole, 
        reason: 'Administrative promotion' 
      });
      fetchUsers();
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await api.put(`/admin/users/${userId}/status?status=${newStatus}`);
      fetchUsers();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select 
                    disabled={u.role === 'SUPER_ADMIN'}
                    onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}
                    defaultValue={u.role || ''}
                  >
                    <SelectTrigger className="w-32">
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
                      {u.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
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
