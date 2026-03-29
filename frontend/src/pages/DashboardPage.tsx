import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-serif font-bold text-lg">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-primary leading-none">Smart Campus Hub</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">University Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {user?.role === 'SUPER_ADMIN' && (
            <div className="flex items-center gap-4 border-r border-border pr-6">
              <Link to="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                User Management
              </Link>
              <Link to="/admin/domains" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Domain Management
              </Link>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.role?.replace('_', ' ')}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 sm:p-12">
        <header className="mb-12 border-b border-border pb-8">
          <h2 className="text-4xl font-serif text-primary mb-2">
            {getGreeting()}, {user?.fullName.split(' ')[0]}.
          </h2>
          <p className="text-muted-foreground font-light text-lg">
            Here is the overview of your campus activities and responsibilities.
          </p>
        </header>

        {user?.role === 'STUDENT' && <StudentDashboard />}
        {user?.role === 'DOMAIN_ADMIN' && <DomainAdminDashboard />}
        {user?.role === 'TECHNICIAN' && <TechnicianDashboard />}
        {user?.role === 'SUPER_ADMIN' && <SuperAdminDashboard />}
        
      </main>
    </div>
  );
};

// --- Role Specific Dashboard Components ---

const StudentDashboard = () => (
  <div className="space-y-12">
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

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
         <h3 className="text-2xl font-serif text-primary border-l-4 border-primary pl-4 mb-6">Active Bookings</h3>
         <div className="bg-card border border-border divide-y divide-border">
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-primary">Library Discussion Room 4</p>
                <p className="text-sm text-muted-foreground">Today, 14:00 - 16:00</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-800 uppercase tracking-widest">Confirmed</span>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-primary">Main Auditorium (Event)</p>
                <p className="text-sm text-muted-foreground">Tomorrow, 09:00 - 12:00</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 uppercase tracking-widest">Pending</span>
            </div>
         </div>
      </div>
      <div>
         <h3 className="text-2xl font-serif text-primary border-l-4 border-muted-foreground pl-4 mb-6">Recent Announcements</h3>
         <div className="space-y-4">
            <article className="border-b border-border pb-4">
              <p className="text-xs text-secondary font-bold mb-1">MARCH 21, 2026</p>
              <h4 className="text-base font-bold text-primary mb-1">Campus Wi-Fi Maintenance Notice</h4>
              <p className="text-sm text-muted-foreground font-light line-clamp-2">Scheduled maintenance for the main campus network will occur this weekend...</p>
            </article>
            <article className="border-b border-border pb-4">
              <p className="text-xs text-secondary font-bold mb-1">MARCH 19, 2026</p>
              <h4 className="text-base font-bold text-primary mb-1">End of Semester Exam Guidelines</h4>
              <p className="text-sm text-muted-foreground font-light line-clamp-2">Please review the updated guidelines for the upcoming examination period...</p>
            </article>
         </div>
      </div>
    </section>
  </div>
);

const DomainAdminDashboard = () => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Active Resources', value: '42' },
        { label: 'Pending Bookings', value: '18' },
        { label: 'Open Tickets', value: '5' },
        { label: 'Domain Utilization', value: '78%' },
      ].map((stat, i) => (
        <div key={i} className="bg-primary text-primary-foreground p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full transition-transform group-hover:scale-150"></div>
          <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-2 relative z-10">{stat.label}</p>
          <p className="text-4xl font-serif relative z-10">{stat.value}</p>
        </div>
      ))}
    </div>

    <section>
      <h3 className="text-2xl font-serif text-primary border-l-4 border-secondary pl-4 mb-6">Requires Attention</h3>
      <div className="bg-card border border-border shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium">Request Type</th>
              <th className="p-4 font-medium">Requested By</th>
              <th className="p-4 font-medium">Resource</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            <tr>
              <td className="p-4 font-bold text-primary">Large Event Booking</td>
              <td className="p-4 text-muted-foreground">Sarah Jenkins (Student)</td>
              <td className="p-4">Main Hall</td>
              <td className="p-4"><Button size="sm" variant="outline" className="rounded-none h-8">Review</Button></td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-primary">Equipment Requisition</td>
              <td className="p-4 text-muted-foreground">Prof. Alan Turing</td>
              <td className="p-4">Projector Set B</td>
              <td className="p-4"><Button size="sm" variant="outline" className="rounded-none h-8">Review</Button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

const TechnicianDashboard = () => (
  <div className="space-y-12">
    <div className="flex items-center gap-4 mb-8 bg-secondary/10 p-4 border border-secondary/30">
      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
      <p className="text-sm font-medium text-primary">You have <span className="font-bold">3 high-priority</span> maintenance tickets assigned to you.</p>
    </div>

    <section>
      <h3 className="text-2xl font-serif text-primary border-l-4 border-primary pl-4 mb-6">Assigned Work Orders</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { id: 'TKT-8902', issue: 'Network Switch Failure', loc: 'IT Block, Floor 2', status: 'URGENT' },
          { id: 'TKT-8905', issue: 'Projector Color Distortion', loc: 'Hall A', status: 'HIGH' },
          { id: 'TKT-8911', issue: 'AC Unit Noise Complaint', loc: 'Library Discussion Room', status: 'NORMAL' },
          { id: 'TKT-8915', issue: 'Smart Board Calibration', loc: 'Lab 4', status: 'NORMAL' },
        ].map((tkt, i) => (
          <div key={i} className="flex border border-border bg-card hover:shadow-md transition-shadow">
            <div className={`w-2 ${tkt.status === 'URGENT' ? 'bg-destructive' : tkt.status === 'HIGH' ? 'bg-secondary' : 'bg-primary'}`}></div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{tkt.id}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-muted">{tkt.status}</span>
                </div>
                <h4 className="text-lg font-bold text-primary mb-1">{tkt.issue}</h4>
                <p className="text-sm text-muted-foreground font-light">{tkt.loc}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors">
                  Update Status →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const SuperAdminDashboard = () => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="p-8 border-t-4 border-primary bg-card shadow-sm">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Total Users</h4>
        <p className="text-5xl font-serif text-primary mb-2">1,248</p>
        <p className="text-sm text-green-600 font-medium">+12 this week</p>
      </div>
      <div className="p-8 border-t-4 border-secondary bg-card shadow-sm">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Active Domains</h4>
        <p className="text-5xl font-serif text-primary mb-2">14</p>
        <p className="text-sm text-muted-foreground font-medium">All operational</p>
      </div>
      <div className="p-8 border-t-4 border-destructive bg-card shadow-sm">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">System Alerts</h4>
        <p className="text-5xl font-serif text-primary mb-2">2</p>
        <p className="text-sm text-destructive font-medium">Requires immediate review</p>
      </div>
    </div>

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <h3 className="text-2xl font-serif text-primary border-l-4 border-primary pl-4 mb-6">Recent System Audit</h3>
        <div className="space-y-0 border border-border bg-card">
          <div className="p-4 border-b border-border flex gap-4 items-center">
            <div className="text-xs text-muted-foreground font-mono">10:45 AM</div>
            <div className="text-sm font-medium">New domain <span className="font-bold">"Sports Complex"</span> created.</div>
          </div>
          <div className="p-4 border-b border-border flex gap-4 items-center">
            <div className="text-xs text-muted-foreground font-mono">09:12 AM</div>
            <div className="text-sm font-medium">User <span className="font-bold">Sarah J.</span> promoted to Domain Admin.</div>
          </div>
          <div className="p-4 flex gap-4 items-center">
            <div className="text-xs text-muted-foreground font-mono">Yesterday</div>
            <div className="text-sm font-medium">System backup completed successfully.</div>
          </div>
        </div>
      </div>
      
      <div className="bg-primary text-primary-foreground p-8 flex flex-col justify-center items-center text-center">
         <h3 className="font-serif text-3xl mb-4">Quick Management</h3>
         <p className="text-primary-foreground/70 font-light mb-8 max-w-sm">
           Navigate directly to administrative consoles to manage university personnel and organizational units.
         </p>
         <div className="flex gap-4">
            <Link to="/admin/users">
              <Button variant="secondary" className="rounded-none px-6">Manage Users</Button>
            </Link>
            <Link to="/admin/domains">
              <Button variant="outline" className="rounded-none px-6 border-white/20 hover:bg-white/10 text-white">Manage Domains</Button>
            </Link>
         </div>
      </div>
    </section>
  </div>
);

export default DashboardPage;
