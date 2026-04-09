import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, AlertCircle, MessageSquare, Wrench, ArrowLeft } from 'lucide-react';

export const TicketsPage: React.FC = () => (
  <div className="p-6 sm:p-8 max-w-[1400px] mx-auto page-enter">

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

    <header className="mb-8">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
        style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
      >
        Support
      </p>
      <h1
        className="font-serif leading-tight mb-1"
        style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
      >
        Maintenance Tickets
      </h1>
      <p
        className="text-[14px] leading-relaxed"
        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
      >
        Report technical issues and request facility maintenance support.
      </p>
      <div
        className="mt-5 h-px"
        style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }}
      />
    </header>

    <div
      className="flex flex-col items-center justify-center py-24 rounded-lg"
      style={{ background: '#FFFFFF', border: '1px dashed #E2E8DF' }}
    >
      <div className="flex items-center gap-3 mb-6">
        {[Ticket, AlertCircle, MessageSquare, Wrench].map((Icon, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(217,68,68,0.06)', opacity: 1 - i * 0.18 }}
          >
            <Icon size={16} style={{ color: '#D94444' }} />
          </div>
        ))}
      </div>
      <p className="font-serif text-[22px] mb-2" style={{ color: '#1A2E1A' }}>
        Coming Soon
      </p>
      <p
        className="text-[13px] text-center max-w-xs"
        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
      >
        The support ticket system is under active development. You'll report and track maintenance requests here.
      </p>
      <div
        className="mt-6 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
        style={{
          background: 'rgba(217,68,68,0.06)',
          color: '#D94444',
          border: '1px solid rgba(217,68,68,0.2)',
          fontFamily: 'Albert Sans, sans-serif',
        }}
      >
        Module C
      </div>
    </div>
  </div>
);

