import React from 'react';
import { Link } from 'react-router-dom';

const ResourcesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8 sm:p-12">
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center mb-8">
          <span className="mr-2">←</span> Return to Dashboard
        </Link>
        <h1 className="text-5xl font-serif text-primary mb-4">Campus Resources</h1>
        <p className="text-muted-foreground font-light text-lg mb-12 border-b border-border pb-8">
          Browse and search for available university labs, equipment, and study halls.
        </p>
        <div className="bg-card border border-dashed border-border p-20 text-center">
          <p className="text-muted-foreground italic">Module A: Resource Catalog Interface (Work in Progress)</p>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
