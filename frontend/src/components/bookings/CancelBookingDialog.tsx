import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BookingResponse } from '@/types/booking';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooking: BookingResponse | null;
  cancellingBooking: boolean;
  handleConfirmCancel: () => void;
  formatTimeRange: (start: string, end: string) => string;
  getResourceName: (resourceId: string) => string;
};

const CancelBookingDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  selectedBooking,
  cancellingBooking,
  handleConfirmCancel,
  formatTimeRange,
  getResourceName,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {selectedBooking && (
          <div
            className="rounded-xl border p-4 text-sm"
            style={{ background: '#FBFCFA', borderColor: '#E2E8DF' }}
          >
            <div className="space-y-2" style={{ color: '#4D5B4D' }}>
              <p>
                <span className="font-semibold" style={{ color: '#1A2E1A' }}>
                  Booking ID:
                </span>{' '}
                #{selectedBooking.id}
              </p>
              <p>
                <span className="font-semibold" style={{ color: '#1A2E1A' }}>
                  Resource:
                </span>{' '}
                {getResourceName(selectedBooking.resourceId)}
              </p>
              <p>
                <span className="font-semibold" style={{ color: '#1A2E1A' }}>
                  Date:
                </span>{' '}
                {selectedBooking.bookingDate}
              </p>
              <p>
                <span className="font-semibold" style={{ color: '#1A2E1A' }}>
                  Time:
                </span>{' '}
                {formatTimeRange(selectedBooking.startTime, selectedBooking.endTime)}
              </p>
              <p>
                <span className="font-semibold" style={{ color: '#1A2E1A' }}>
                  Status:
                </span>{' '}
                {selectedBooking.status}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancellingBooking}
            className="border-[#D8E0D4] bg-white"
          >
            Keep Booking
          </Button>

          <Button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancellingBooking}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {cancellingBooking ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;