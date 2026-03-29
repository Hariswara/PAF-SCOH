import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/dashboard" className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors flex items-center mb-4">
            <span className="mr-2">←</span> Return to Dashboard
          </Link>
          <h1 className="text-4xl font-serif mb-2">Domain Management</h1>
          <p className="text-primary-foreground/70 font-light max-w-xl text-sm">
            Configure and oversee the operational units within the university ecosystem.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Create Section */}
        <section className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-2xl font-serif text-primary border-l-4 border-secondary pl-4 mb-2">Establish Unit</h2>
            <p className="text-sm text-muted-foreground font-light mb-6">Define a new operational domain for the campus.</p>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-6 bg-card border border-border p-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Domain Name</label>
              <Input 
                placeholder="e.g. Science Laboratory Complex" 
                value={newDomain.name} 
                onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                required
                className="h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description</label>
              <Input 
                placeholder="Brief operational purpose" 
                value={newDomain.description} 
                onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
                className="h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest uppercase text-xs"
            >
              {isSubmitting ? 'Registering...' : 'Register Domain'}
            </Button>
          </form>
        </section>

        {/* List Section */}
        <section className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-serif text-primary border-l-4 border-primary pl-4 mb-2">Active Infrastructure</h2>
            <p className="text-sm text-muted-foreground font-light mb-6">Monitor and toggle the status of existing campus domains.</p>
          </div>
          
          <div className="bg-card border border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-border">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Domain Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Purpose</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Status</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-light">
                      No domains configured yet. Use the panel to establish the first unit.
                    </TableCell>
                  </TableRow>
                ) : (
                  domains.map((d) => (
                    <TableRow key={d.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-serif text-lg text-primary font-bold py-4">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground font-light text-sm py-4">{d.description || '—'}</TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                          d.isActive 
                            ? 'bg-green-100/50 text-green-700 border border-green-200' 
                            : 'bg-red-100/50 text-red-700 border border-red-200'
                        }`}>
                          {d.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <button 
                          onClick={() => handleToggleStatus(d.id)}
                          className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                            d.isActive ? 'text-destructive hover:text-destructive/70' : 'text-primary hover:text-secondary'
                          }`}
                        >
                          {d.isActive ? 'Suspend' : 'Reactivate'}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DomainManagementPage;
