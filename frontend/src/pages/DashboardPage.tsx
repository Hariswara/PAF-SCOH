import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardStats {
  totalUsers: number;
  activeDomains: number;
  pendingActivations: number;
  systemAlerts: number;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  changedByName: string;
  newRole: string;
  newDomainName: string | null;
  changedAt: string;
}

const STORAGE_KEYS = {
  STATS: 'scoh_dashboard_stats',
  ACTIVITY: 'scoh_dashboard_activity',
  PENDING: 'scoh_dashboard_pending',
  TIMESTAMP: 'scoh_dashboard_last_fetch'
};

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Hydrate state from localStorage
  const [stats, setStats] = useState<DashboardStats | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : null;
  });
  
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingUsers, setPendingUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PENDING);
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(!stats);

  const fetchAdminData = async () => {
    try {
      const [statsRes, logsRes, pendingRes] = await Promise.all([
        api.get('/admin/users/dashboard/stats'),
        api.get('/admin/users/audit-logs'),
        api.get('/admin/users/pending-activations')
      ]);
      
      const newStats = statsRes.data;
      const newActivity = logsRes.data.slice(0, 5);
      const newPending = pendingRes.data;

      setStats(newStats);
      setRecentActivity(newActivity);
      setPendingUsers(newPending);

      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(newActivity));
      localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(newPending));
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
      
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <nav className="border-b border-border bg-card px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-serif font-bold text-lg">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-primary leading-none">Smart Campus Hub</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">University Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 border-r border-border pr-6">
            <Link to="/resources" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Resources</Link>
            <Link to="/bookings" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Bookings</Link>
            <Link to="/tickets" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Tickets</Link>
          </div>
          {user?.role === 'SUPER_ADMIN' && (
            <div className="flex items-center gap-4 border-r border-border pr-6">
              <Link to="/admin/users" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                Personnel
              </Link>
              <Link to="/admin/domains" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                Domains
              </Link>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-primary">{user?.fullName}</p>
              <p className="text-[10px] text-muted-foreground">{user?.role?.replace('_', ' ')}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="h-8 rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all text-[10px] uppercase font-bold tracking-widest">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/resources">
            <div className="p-4 border rounded-lg bg-blue-50 text-blue-700 font-medium text-center hover:bg-blue-100 cursor-pointer transition-colors">
              Resources (Module A)
            </div>
          </Link>
          <div className="p-4 border rounded-lg bg-green-50 text-green-700 font-medium text-center">
            Bookings (Module B)
          </div>
          <div className="p-4 border rounded-lg bg-purple-50 text-purple-700 font-medium text-center">
            Tickets (Module C)
          </div>
          {isLoading && stats && (
            <div className="flex items-center gap-2 mb-1">
               <div className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Updating...</span>
            </div>
          )}
        </header>

        {user?.role === 'STUDENT' && <StudentDashboard />}
        {user?.role === 'DOMAIN_ADMIN' && <DomainAdminDashboard />}
        {user?.role === 'TECHNICIAN' && <TechnicianDashboard />}
        {user?.role === 'SUPER_ADMIN' && (
          isLoading && !stats ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <SuperAdminDashboard 
              stats={stats} 
              activity={recentActivity} 
              pending={pendingUsers} 
              onActionComplete={fetchAdminData}
            />
          )
        )}
      </main>
    </div>
  );
};

const StudentDashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link to="/resources" className="group p-6 bg-card border border-border hover:border-secondary transition-all hover:shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 rounded-bl-[60px] transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 text-primary group-hover:text-secondary transition-colors">
          <h3 className="text-lg font-serif font-bold mb-1">Resource Catalog</h3>
          <p className="text-xs text-muted-foreground font-light mb-4">Browse and find study spaces.</p>
          <div className="text-[10px] font-bold tracking-widest uppercase">Explore →</div>
        </div>
      </Link>
      <Link to="/bookings" className="group p-6 bg-card border border-border hover:border-primary transition-all hover:shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-[60px] transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 text-primary group-hover:text-primary transition-colors">
          <h3 className="text-lg font-serif font-bold mb-1">My Bookings</h3>
          <p className="text-xs text-muted-foreground font-light mb-4">Manage reservations.</p>
          <div className="text-[10px] font-bold tracking-widest uppercase">Manage →</div>
        </div>
      </Link>
      <Link to="/tickets" className="group p-6 bg-card border border-border hover:border-destructive transition-all hover:shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/5 rounded-bl-[60px] transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 text-primary group-hover:text-destructive transition-colors">
          <h3 className="text-lg font-serif font-bold mb-1">Support Tickets</h3>
          <p className="text-xs text-muted-foreground font-light mb-4">Report technical issues.</p>
          <div className="text-[10px] font-bold tracking-widest uppercase">Open Case →</div>
        </div>
      </Link>
    </div>

    <section>
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-2xl font-serif text-primary border-l-4 border-secondary pl-4">Academic Schedule</h3>
        <button className="text-sm font-medium text-secondary hover:underline underline-offset-4">View Full Calendar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { course: 'Computer Architecture', time: '10:00 AM - 12:00 PM', location: 'Hall A', type: 'Lecture' },
          { course: 'Software Engineering', time: '01:00 PM - 03:00 PM', location: 'Lab 3', type: 'Practical' },
          { course: 'Advanced Algorithms', time: '04:00 PM - 05:30 PM', location: 'Hall C', type: 'Seminar' },
        ].map((cls, i) => (
          <div key={i} className="bg-card border border-border p-6 hover:shadow-lg hover:border-secondary transition-all group">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{cls.type}</span>
            <h4 className="text-lg font-bold text-primary mb-4 group-hover:text-secondary transition-colors">{cls.course}</h4>
            <div className="flex justify-between items-center text-sm font-light">
              <span>{cls.time}</span>
              <span className="bg-muted px-2 py-1 rounded-sm text-xs font-medium">{cls.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const SuperAdminDashboard = ({ stats, activity, pending, onActionComplete }: { 
  stats: DashboardStats | null, 
  activity: AuditLog[], 
  pending: User[], 
  onActionComplete: () => void 
}) => {
  
  const handleAssignRole = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, {
        newRole: role,
        reason: 'Initial assignment from dashboard queue'
      });
      onActionComplete();
    } catch (error) {
      alert('Assignment failed. Domain Admin requires full personnel console for domain selection.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border-t-4 border-primary bg-card shadow-sm hover:shadow-md transition-all">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Total Users</h4>
          <p className="text-4xl font-serif text-primary mb-1">{stats?.totalUsers ?? '...'}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Campus Personnel</p>
        </div>
        <div className="p-6 border-t-4 border-secondary bg-card shadow-sm hover:shadow-md transition-all">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Active Domains</h4>
          <p className="text-4xl font-serif text-primary mb-1">{stats?.activeDomains ?? '...'}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Operating Units</p>
        </div>
        <div className="p-6 border-t-4 border-destructive bg-card shadow-sm hover:shadow-md transition-all">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">System Alerts</h4>
          <p className="text-4xl font-serif text-primary mb-1">{stats?.systemAlerts ?? '0'}</p>
          <p className="text-[10px] text-destructive font-bold uppercase tracking-wider">Suspended Access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif text-primary border-l-4 border-primary pl-4">System Audit Feed</h3>
            <Link to="/admin/audit" className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:underline">Full Log →</Link>
          </div>
          <div className="space-y-0 border border-border bg-card shadow-sm max-h-[350px] overflow-y-auto">
            {activity.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground font-light italic text-sm">No recent activities recorded.</div>
            ) : (
              activity.map((log) => (
                <div key={log.id} className="p-4 border-b border-border flex gap-4 items-center group hover:bg-muted/30 transition-colors">
                  <div className="text-[10px] text-muted-foreground font-mono min-w-[85px] leading-tight">
                    {format(new Date(log.changedAt), 'MMM dd')} <br />
                    <span className="opacity-60">{format(new Date(log.changedAt), 'HH:mm')}</span>
                  </div>
                  <div className="text-xs font-medium text-primary/80">
                     <span className="font-bold text-primary">{log.userEmail}</span> transitioned to <span className="text-secondary font-bold">
                       {log.newRole.replace('_', ' ')} {log.newDomainName ? `(${log.newDomainName})` : ''}
                     </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif text-primary border-l-4 border-secondary pl-4">Pending Clearance</h3>
            <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              {pending.length} Waiting
            </span>
          </div>
          <div className="bg-card border border-border shadow-sm overflow-hidden flex flex-col max-h-[350px]">
            {pending.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground/40">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-serif text-primary font-bold">Queue Clear</p>
                <p className="text-xs text-muted-foreground font-light">All staff accounts are currently active.</p>
              </div>
            ) : (
              <div className="divide-y divide-border overflow-y-auto">
                {pending.map((p) => (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate">{p.fullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select onValueChange={(val) => {
                        if (val === 'DOMAIN_ADMIN') {
                          window.location.href = '/admin/users';
                        } else {
                          handleAssignRole(p.id, val);
                        }
                      }}>
                        <SelectTrigger className="h-8 w-28 text-[10px] font-bold uppercase tracking-wider rounded-none">
                          <SelectValue placeholder="CLEAR AS..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TECHNICIAN">Technician</SelectItem>
                          <SelectItem value="DOMAIN_ADMIN">Domain Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-bold uppercase tracking-widest">
                        <Link to="/admin/users">Full Profile</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 bg-muted/30 border-t border-border mt-auto">
               <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest font-medium">
                 Authorized staff must be vetted before granting system-wide access.
               </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const DomainAdminDashboard = () => (
  <div className="p-12 text-center text-muted-foreground italic">Domain Admin Console (Optimizing Space...)</div>
);

const TechnicianDashboard = () => (
  <div className="p-12 text-center text-muted-foreground italic">Technician Console (Optimizing Space...)</div>
);

export default DashboardPage;
