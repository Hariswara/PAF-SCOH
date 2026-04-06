import React from 'react';
import { Link } from 'react-router-dom';

const BookingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8 sm:p-12">
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center mb-8">
          <span className="mr-2">←</span> Return to Dashboard
        </Link>
        <h1 className="text-5xl font-serif text-primary mb-4">Facility Bookings</h1>
        <p className="text-muted-foreground font-light text-lg mb-12 border-b border-border pb-8">
          Manage your room reservations and academic space requests.
        </p>
        <div className="bg-card border border-dashed border-border p-20 text-center">
          <p className="text-muted-foreground italic">Module B: Booking Management Interface (Work in Progress)</p>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
