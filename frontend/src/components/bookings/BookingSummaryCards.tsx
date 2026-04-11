import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  isAdmin: boolean;
  total: number;
  pending: number;
  approved: number;
  cancelled: number;
  rejected: number;
};

const BookingSummaryCards: React.FC<Props> = ({
  isAdmin,
  total,
  pending,
  approved,
  cancelled,
  rejected,
}) => {
  const items = [
    { label: 'Total Bookings', value: total },
    { label: 'Pending', value: pending },
    { label: 'Approved', value: approved },
    {
      label: isAdmin ? 'Rejected' : 'Cancelled',
      value: isAdmin ? rejected : cancelled,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {items.map((item) => (
        <Card key={item.label} className="border-[#E2E8DF] shadow-sm bg-white">
          <CardContent className="py-5">
            <p
              className="text-[11px] uppercase tracking-[0.15em] mb-2"
              style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
              {item.label}
            </p>
            <p className="font-serif text-[28px]" style={{ color: '#1A2E1A' }}>
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingSummaryCards;