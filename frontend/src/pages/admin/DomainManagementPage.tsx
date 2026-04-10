import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Globe2, Plus, ArrowLeft } from 'lucide-react';

interface Domain { id: string; name: string; description?: string; isActive: boolean; }

const DomainManagementPage: React.FC = () => {
  const [domains, setDomains]         = useState<Domain[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDomain, setNewDomain]     = useState({ name: '', description: '' });

  const fetchDomains = async () => {
    try {
      const r = await api.get('/domains');
      setDomains(r.data);
    } catch (e) {
      console.error('Failed to fetch domains:', e);
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
    } catch {
      alert('Failed to create domain. Ensure you are logged in as Super Admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/domains/${id}/toggle-status`);
      fetchDomains();
    } catch {
      alert('Failed to update domain status');
    }
  };

  useEffect(() => { fetchDomains(); }, []);

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

  const inputClass = "h-11 bg-transparent text-[#1A2E1A] placeholder:text-[#B8C4B3] border-0 border-b rounded-none focus-visible:ring-0 px-0 text-[15px]";

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
          <Globe2 size={22} style={{ color: '#5B8C5A' }} />
          <h1
            className="font-serif leading-tight"
            style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
          >
            Domain Management
          </h1>
        </div>
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Configure and oversee the operational units within the university ecosystem.
        </p>
        <div
          className="mt-5 h-px"
          style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }}
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Create panel */}
        <section className="lg:col-span-1">
          <div
            className="p-6 rounded-lg"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}
          >
            <h2 className="font-serif text-[20px] mb-1" style={{ color: '#1A2E1A' }}>
              Establish Unit
            </h2>
            <p
              className="text-[13px] mb-6"
              style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
              Define a new operational domain for the campus.
            </p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  Domain Name
                </label>
                <Input
                  placeholder="e.g. Science Laboratory Complex"
                  value={newDomain.name}
                  onChange={e => setNewDomain({ ...newDomain, name: e.target.value })}
                  required
                  className={inputClass}
                  style={{ borderBottomColor: '#E2E8DF' }}
                  onFocus={e  => (e.target.style.borderBottomColor = '#2D7A3A')}
                  onBlur={e   => (e.target.style.borderBottomColor = '#E2E8DF')}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  Description
                </label>
                <Input
                  placeholder="Brief operational purpose"
                  value={newDomain.description}
                  onChange={e => setNewDomain({ ...newDomain, description: e.target.value })}
                  className={inputClass}
                  style={{ borderBottomColor: '#E2E8DF' }}
                  onFocus={e  => (e.target.style.borderBottomColor = '#2D7A3A')}
                  onBlur={e   => (e.target.style.borderBottomColor = '#E2E8DF')}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 font-semibold tracking-wider uppercase text-[12px] rounded-md"
                style={{
                  background: '#2D7A3A',
                  color: '#FFFFFF',
                  fontFamily: 'Albert Sans, sans-serif',
                }}
              >
                <Plus size={14} className="mr-1.5" />
                {isSubmitting ? 'Registering\u2026' : 'Register Domain'}
              </Button>
            </form>
          </div>
        </section>

        {/* Table */}
        <section className="lg:col-span-2">
          <h2 className="font-serif text-[20px] mb-1" style={{ color: '#1A2E1A' }}>
            Active Infrastructure
          </h2>
          <p
            className="text-[13px] mb-5"
            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
          >
            Monitor and toggle the status of existing campus domains.
          </p>

          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid #E2E8DF' }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ background: '#F2F5F0', borderBottom: '1px solid #E2E8DF' }}>
                  {['Domain Name', 'Purpose', 'Status', ''].map(h => (
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
                {domains.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-14"
                      style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      No domains configured yet. Use the panel to establish the first unit.
                    </TableCell>
                  </TableRow>
                ) : domains.map(d => (
                  <TableRow
                    key={d.id}
                    style={{ borderBottom: '1px solid #E2E8DF' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F2F5F0')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <TableCell className="py-4 pl-4">
                      <p className="font-serif text-[16px]" style={{ color: '#1A2E1A' }}>
                        {d.name}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p
                        className="text-[13px]"
                        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                      >
                        {d.description || '\u2014'}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          background: d.isActive ? 'rgba(45,122,58,0.08)'  : 'rgba(217,68,68,0.08)',
                          color:      d.isActive ? '#2D7A3A'                : '#D94444',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: d.isActive ? '#2D7A3A' : '#D94444' }}
                        />
                        {d.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-4">
                      <button
                        onClick={() => handleToggle(d.id)}
                        className="text-[12px] font-semibold uppercase tracking-wider transition-colors"
                        style={{
                          color: d.isActive ? '#D94444' : '#2D7A3A',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        {d.isActive ? 'Suspend' : 'Reactivate'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DomainManagementPage;
