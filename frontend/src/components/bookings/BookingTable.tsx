import React from 'react';
import { CheckCircle2, ClipboardList, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BookingResponse } from '@/types/booking';

type Props = {
  bookings: BookingResponse[];
  isAdmin: boolean;
  hasActiveFilters: boolean;
  loadingBookings: boolean;
  bookingsError: string;
  getResourceName: (resourceId: string) => string;
  formatTimeRange: (start: string, end: string) => string;
  canCancelBooking: (status: string) => boolean;
  canReviewBooking: (status: string) => boolean;
  getStatusBadgeStyles: (status: string) => {
    background: string;
    color: string;
    borderColor: string;
  };
  openCancelDialog: (booking: BookingResponse) => void;
  openReviewDialog: (
    booking: BookingResponse,
    action: 'APPROVE' | 'REJECT'
  ) => void;
};

const BookingTable: React.FC<Props> = ({
  bookings,
  isAdmin,
  hasActiveFilters,
  loadingBookings,
  bookingsError,
  getResourceName,
  formatTimeRange,
  canCancelBooking,
  canReviewBooking,
  getStatusBadgeStyles,
  openCancelDialog,
  openReviewDialog,
}) => {
  if (loadingBookings) {
    return (
      <div
        className="rounded-xl border border-dashed px-6 py-14 text-center"
        style={{ borderColor: '#DCE5D7', background: '#FBFCFA' }}
      >
        <p
          className="text-[14px]"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          {isAdmin ? 'Loading bookings...' : 'Loading your bookings...'}
        </p>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div
        className="rounded-lg px-4 py-3 text-sm"
        style={{
          background: 'rgba(217,68,68,0.08)',
          border: '1px solid rgba(217,68,68,0.18)',
          color: '#B42318',
          fontFamily: 'Albert Sans, sans-serif',
        }}
      >
        {bookingsError}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed px-6 py-14 text-center"
        style={{ borderColor: '#DCE5D7', background: '#FBFCFA' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(91,140,90,0.08)' }}
        >
          <ClipboardList size={22} style={{ color: '#2D7A3A' }} />
        </div>

        <p
          className="font-serif text-[24px] mb-2"
          style={{ color: '#1A2E1A' }}
        >
          {hasActiveFilters
            ? 'No matching bookings'
            : isAdmin
              ? 'No bookings found'
              : 'No bookings yet'}
        </p>

        <p
          className="text-[14px]"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          {hasActiveFilters
            ? 'Try changing or clearing the filters to see more results.'
            : isAdmin
              ? 'Bookings will appear here when users create requests.'
              : 'Your booking history will appear here once you create requests.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: '#E2E8DF' }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Booking Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Attendees</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bookings.map((booking) => {
            const badgeStyle = getStatusBadgeStyles(booking.status);
            const canCancel = canCancelBooking(booking.status);
            const canReview = canReviewBooking(booking.status);

            return (
              <TableRow key={booking.id}>
                <TableCell>
                  <span
                    className="px-2 py-1 rounded-md text-xs font-semibold"
                    style={{
                      background: 'rgba(91,140,90,0.08)',
                      color: '#2D7A3A',
                      fontFamily: 'Albert Sans, sans-serif',
                    }}
                  >
                    #{booking.id}
                  </span>
                </TableCell>

                <TableCell
                  className="font-medium"
                  style={{ color: '#1A2E1A' }}
                  title={booking.resourceId}
                >
                  {getResourceName(booking.resourceId)}
                </TableCell>

                <TableCell style={{ color: '#4D5B4D' }}>
                  {booking.bookingDate}
                </TableCell>

                <TableCell style={{ color: '#4D5B4D' }}>
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </TableCell>

                <TableCell
                  style={{ color: '#4D5B4D', maxWidth: 260 }}
                  className="truncate"
                  title={booking.purpose}
                >
                  {booking.purpose}
                </TableCell>

                <TableCell style={{ color: '#4D5B4D' }}>
                  {booking.expectedAttendees}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em]"
                    style={{
                      background: badgeStyle.background,
                      color: badgeStyle.color,
                      borderColor: badgeStyle.borderColor,
                      fontFamily: 'Albert Sans, sans-serif',
                    }}
                  >
                    {booking.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  {isAdmin ? (
                    canReview ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => openReviewDialog(booking, 'APPROVE')}
                          className="bg-[#2D7A3A] hover:bg-[#256632] text-white"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openReviewDialog(booking, 'REJECT')}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <XCircle size={14} />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span
                        className="text-xs"
                        style={{
                          color: '#9AA79A',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        Not available
                      </span>
                    )
                  ) : canCancel ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openCancelDialog(booking)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle size={14} />
                      Cancel
                    </Button>
                  ) : (
                    <span
                      className="text-xs"
                      style={{
                        color: '#9AA79A',
                        fontFamily: 'Albert Sans, sans-serif',
                      }}
                    >
                      Not allowed
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;