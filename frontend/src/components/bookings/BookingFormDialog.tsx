import React from 'react';
import {
  AlertCircle,
  CalendarCheck,
  ClipboardList,
  Clock3,
  MapPin,
  PlusCircle,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ResourceResponse } from '@/types/resource';

type FieldErrors = {
  resourceId?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  expectedAttendees?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  setResourceId: (value: string) => void;
  resources: ResourceResponse[];
  loadingResources: boolean;
  bookingDate: string;
  setBookingDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  purpose: string;
  setPurpose: (value: string) => void;
  expectedAttendees: string;
  setExpectedAttendees: (value: string) => void;
  errors: FieldErrors;
  errorMessage: string;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  submittingBooking: boolean;
  selectedResource?: ResourceResponse;
  today: string;
  isEditMode: boolean;
};

const BookingFormDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  resourceId,
  setResourceId,
  resources,
  loadingResources,
  bookingDate,
  setBookingDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  purpose,
  setPurpose,
  expectedAttendees,
  setExpectedAttendees,
  errors,
  errorMessage,
  resetForm,
  handleSubmit,
  submittingBooking,
  selectedResource,
  today,
  isEditMode,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[96vw] !max-w-[1200px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
          <div className="p-6 sm:p-8 lg:border-r border-[#E2E8DF]">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <DialogTitle
                  className="font-serif text-[24px]"
                  style={{ color: '#1A2E1A' }}
                >
                  {isEditMode ? 'Edit Booking Request' : 'Create Booking Request'}
                </DialogTitle>
                <DialogDescription
                  className="text-[13px] mt-2"
                  style={{
                    color: '#6B7B6B',
                    fontFamily: 'Albert Sans, sans-serif',
                  }}
                >
                  {isEditMode
                    ? 'Update the booking details below.'
                    : 'Complete the form below to submit your booking request.'}
                </DialogDescription>
              </div>

              <Badge
                className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.15em]"
                style={{
                  background: 'rgba(91,140,90,0.08)',
                  color: '#2D7A3A',
                  borderColor: 'rgba(45,122,58,0.15)',
                  fontFamily: 'Albert Sans, sans-serif',
                }}
                variant="outline"
              >
                UI READY
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="resourceId">Resource</Label>
                  <Select value={resourceId} onValueChange={setResourceId}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue
                        placeholder={
                          loadingResources ? 'Loading resources...' : 'Select a resource'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingResources ? (
                        <SelectItem value="LOADING" disabled>
                          Loading resources...
                        </SelectItem>
                      ) : resources.length === 0 ? (
                        <SelectItem value="NO_RESOURCES" disabled>
                          No active resources available
                        </SelectItem>
                      ) : (
                        resources.map((resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {errors.resourceId && (
                    <p className="text-sm text-red-600">{errors.resourceId}</p>
                  )}

                  <p
                    className="text-[12px]"
                    style={{
                      color: '#6B7B6B',
                      fontFamily: 'Albert Sans, sans-serif',
                    }}
                  >
                    Select an active resource for this booking request.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingDate">Booking Date</Label>
                  <Input
                    id="bookingDate"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="bg-white"
                    min={today}
                  />
                  {errors.bookingDate && (
                    <p className="text-sm text-red-600">{errors.bookingDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-white"
                    min="08:00"
                    max="21:00"
                  />
                  {errors.startTime && (
                    <p className="text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-white"
                    min="08:00"
                    max="21:00"
                  />
                  {errors.endTime && (
                    <p className="text-sm text-red-600">{errors.endTime}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly describe why you need this booking"
                    className="bg-white min-h-[110px]"
                  />
                  {errors.purpose && (
                    <p className="text-sm text-red-600">{errors.purpose}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedAttendees">Expected Attendees</Label>
                  <Input
                    id="expectedAttendees"
                    type="number"
                    min={1}
                    value={expectedAttendees}
                    onChange={(e) => setExpectedAttendees(e.target.value)}
                    className="bg-white"
                    placeholder="e.g. 25"
                  />
                  {errors.expectedAttendees && (
                    <p className="text-sm text-red-600">
                      {errors.expectedAttendees}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  background: 'rgba(45,122,58,0.05)',
                  borderColor: 'rgba(45,122,58,0.12)',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={16}
                    style={{ color: '#2D7A3A', marginTop: 2 }}
                  />
                  <div>
                    <p
                      className="text-[13px] font-semibold"
                      style={{
                        color: '#1A2E1A',
                        fontFamily: 'Albert Sans, sans-serif',
                      }}
                    >
                      Integration Note
                    </p>
                    <p
                      className="text-[12px] leading-relaxed mt-1"
                      style={{
                        color: '#6B7B6B',
                        fontFamily: 'Albert Sans, sans-serif',
                      }}
                    >
                      Booking requests are validated before submission. Select a resource,
                      choose a valid time range, and ensure attendee count fits the capacity.
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(217,68,68,0.08)',
                    border: '1px solid rgba(217,68,68,0.18)',
                    color: '#B42318',
                    fontFamily: 'Albert Sans, sans-serif',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-[#D8E0D4] bg-white"
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-[#D8E0D4] bg-white"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submittingBooking}
                  className="bg-[#2D7A3A] hover:bg-[#256632] text-white"
                >
                  {submittingBooking
                    ? isEditMode
                      ? 'Updating...'
                      : 'Submitting...'
                    : isEditMode
                      ? 'Update Booking'
                      : 'Submit Booking'}
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="p-6 sm:p-8 bg-white">
            <h2
              className="font-serif text-[22px] mb-2"
              style={{ color: '#1A2E1A' }}
            >
              Quick Overview
            </h2>
            <p
              className="mb-6 text-[13px]"
              style={{
                color: '#6B7B6B',
                fontFamily: 'Albert Sans, sans-serif',
              }}
            >
              Review the selected resource details before submitting your booking request.
            </p>

            <div className="space-y-4">
              <div
                className="rounded-xl border p-4"
                style={{ background: '#FBFCFA', borderColor: '#E2E8DF' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ background: 'rgba(91,140,90,0.08)' }}
                  >
                    <ClipboardList size={18} style={{ color: '#2D7A3A' }} />
                  </div>
                  <div>
                    <p
                      className="text-[12px] uppercase tracking-[0.16em] font-semibold"
                      style={{
                        color: '#6B7B6B',
                        fontFamily: 'Albert Sans, sans-serif',
                      }}
                    >
                      Selected Resource
                    </p>
                    <p
                      className="font-serif text-[22px]"
                      style={{ color: '#1A2E1A' }}
                    >
                      {selectedResource?.name || 'No resource selected'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div
                    className="rounded-lg px-3 py-3"
                    style={{ background: 'white', border: '1px solid #E9EEE6' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} style={{ color: '#5B8C5A' }} />
                      <span
                        style={{
                          color: '#6B7B6B',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        Location
                      </span>
                    </div>
                    <p style={{ color: '#1A2E1A' }}>
                      {selectedResource?.location || '—'}
                    </p>
                  </div>

                  <div
                    className="rounded-lg px-3 py-3"
                    style={{ background: 'white', border: '1px solid #E9EEE6' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={14} style={{ color: '#5B8C5A' }} />
                      <span
                        style={{
                          color: '#6B7B6B',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        Capacity
                      </span>
                    </div>
                    <p style={{ color: '#1A2E1A' }}>
                      {selectedResource?.capacity ?? '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl border p-4"
                style={{ background: '#FBFCFA', borderColor: '#E2E8DF' }}
              >
                <p
                  className="text-[12px] uppercase tracking-[0.16em] font-semibold mb-3"
                  style={{
                    color: '#6B7B6B',
                    fontFamily: 'Albert Sans, sans-serif',
                  }}
                >
                  Validation Tips
                </p>

                <div className="space-y-3 text-sm">
                  {[
                    {
                      icon: CalendarCheck,
                      label: 'Choose a valid booking date',
                    },
                    {
                      icon: Clock3,
                      label: 'Ensure start time is earlier than end time',
                    },
                    {
                      icon: PlusCircle,
                      label: 'Expected attendees should be at least 1',
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(91,140,90,0.08)' }}
                      >
                        <item.icon size={15} style={{ color: '#2D7A3A' }} />
                      </div>
                      <p
                        className="leading-relaxed"
                        style={{
                          color: '#4D5B4D',
                          fontFamily: 'Albert Sans, sans-serif',
                        }}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFormDialog;