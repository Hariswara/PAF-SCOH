import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Domain {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const DomainManagementPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDomain, setNewDomain] = useState({ name: '', description: '' });

  const fetchDomains = async () => {
    try {
      const response = await api.get('/domains');
      setDomains(response.data);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/domains', newDomain);
      setNewDomain({ name: '', description: '' });
      fetchDomains();
    } catch (error) {
      alert('Failed to create domain. Ensure you are logged in as Super Admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/domains/${id}/toggle-status`);
      fetchDomains();
    } catch (error) {
      alert('Failed to update domain status');
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  if (isLoading) return <div className="p-8 text-center">Loading domains...</div>;

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Domain Management</h1>
      </div>

      {/* Create Section */}
      <section className="border p-6 rounded-lg bg-gray-50 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Add New Domain</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input 
                placeholder="e.g. Main Library" 
                value={newDomain.name} 
                onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Input 
                placeholder="Brief description" 
                value={newDomain.description} 
                onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Domain'}
          </Button>
        </form>
      </section>

      {/* List Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Campus Operational Units</h2>
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No domains configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                domains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-gray-600">{d.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {d.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant={d.isActive ? 'outline' : 'secondary'} 
                        size="sm"
                        onClick={() => handleToggleStatus(d.id)}
                      >
                        {d.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default DomainManagementPage;
