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
  reviewAction: 'APPROVE' | 'REJECT' | null;
  processingReviewAction: boolean;
  handleConfirmReview: () => void;
  formatTimeRange: (start: string, end: string) => string;
  getResourceName: (resourceId: string) => string;
};

const ReviewBookingDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  selectedBooking,
  reviewAction,
  processingReviewAction,
  handleConfirmReview,
  formatTimeRange,
  getResourceName,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {reviewAction === 'APPROVE' ? 'Approve Booking' : 'Reject Booking'}
          </DialogTitle>
          <DialogDescription>
            {reviewAction === 'APPROVE'
              ? 'Are you sure you want to approve this booking request?'
              : 'Are you sure you want to reject this booking request?'}
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
                  Purpose:
                </span>{' '}
                {selectedBooking.purpose}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processingReviewAction}
            className="border-[#D8E0D4] bg-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirmReview}
            disabled={processingReviewAction}
            className={
              reviewAction === 'APPROVE'
                ? 'bg-[#2D7A3A] hover:bg-[#256632] text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }
          >
            {processingReviewAction
              ? reviewAction === 'APPROVE'
                ? 'Approving...'
                : 'Rejecting...'
              : reviewAction === 'APPROVE'
                ? 'Yes, Approve'
                : 'Yes, Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewBookingDialog;