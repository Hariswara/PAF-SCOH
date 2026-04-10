import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  CalendarCheck,
  ClipboardList,
  Clock3,
  MapPin,
  PlusCircle,
  RefreshCw,
  Users,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import {
  approveBooking,
  cancelBooking,
  createBooking,
  getBookings,
  getMyBookings,
  rejectBooking,
  type BookingResponse,
} from '../services/booking.service';
import { getResources } from '../services/resource.service';
import type { ResourceResponse } from '../types/resource';

type FieldErrors = {
  resourceId?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  expectedAttendees?: string;
};

type ReviewAction = 'APPROVE' | 'REJECT' | null;

const BookingsPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  const currentRole = user?.role;
  const isAdmin =
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'DOMAIN_ADMIN';

  const [showForm, setShowForm] = useState(false);

  const [resourceId, setResourceId] = useState('');
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>(null);

  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [processingReviewAction, setProcessingReviewAction] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === resourceId),
    [resources, resourceId]
  );

  const validateForm = () => {
    const newErrors: FieldErrors = {};

    if (!resourceId) {
      newErrors.resourceId = 'Resource is required.';
    }

    if (!bookingDate) {
      newErrors.bookingDate = 'Booking date is required.';
    } else if (bookingDate < today) {
      newErrors.bookingDate = 'Booking date cannot be in the past.';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required.';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required.';
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'End time must be later than start time.';
    }

    if (!purpose.trim()) {
      newErrors.purpose = 'Purpose is required.';
    }

    if (!expectedAttendees) {
      newErrors.expectedAttendees = 'Expected attendees is required.';
    } else {
      const count = Number(expectedAttendees);

      if (Number.isNaN(count) || count < 1) {
        newErrors.expectedAttendees = 'Expected attendees must be at least 1.';
      } else if (
        selectedResource?.capacity != null &&
        count > selectedResource.capacity
      ) {
        newErrors.expectedAttendees = `Expected attendees cannot exceed capacity of ${selectedResource.capacity}.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setResourceId('');
    setBookingDate('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setExpectedAttendees('');
    setErrors({});
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const isValid = validateForm();

    if (!isValid) {
      setErrorMessage('Please correct the highlighted fields and try again.');
      return;
    }

    setSubmittingBooking(true);

    try {
      await createBooking({
        resourceId,
        bookingDate,
        startTime,
        endTime,
        purpose: purpose.trim(),
        expectedAttendees: Number(expectedAttendees),
      });

      setShowForm(false);
      resetForm();
      setSuccessMessage('Booking request submitted successfully.');

      await loadBookings(
        {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          date: dateFilter || undefined,
        },
        true
      );
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Failed to create booking.'
      );
    } finally {
      setSubmittingBooking(false);
    }
  };

  const loadResources = async () => {
    setLoadingResources(true);

    try {
      const data = await getResources();
      const activeResources = data.filter((resource) => resource.status === 'ACTIVE');
      setResources(activeResources);
    } catch (error) {
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const loadBookings = async (
    filters?: { status?: string; date?: string },
    isRefresh = false
  ) => {
    if (!isRefresh) {
      setLoadingBookings(true);
    }

    setBookingsError('');

    try {
      const data = isAdmin
        ? await getBookings(filters)
        : await getMyBookings(filters);

      setBookings(data);
    } catch (error: any) {
      setBookingsError(
        error?.response?.data?.message ||
          (isAdmin
            ? 'Failed to load bookings.'
            : 'Failed to load your bookings.')
      );
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    void loadBookings({
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      date: dateFilter || undefined,
    });
  }, [statusFilter, dateFilter, isAdmin, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAdmin) {
      void loadResources();
    }
  }, [isLoading, isAdmin]);

  const handleRefresh = async () => {
    setSuccessMessage('');
    setActionErrorMessage('');

    await loadBookings(
      {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        date: dateFilter || undefined,
      },
      true
    );
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setDateFilter('');
  };

  const hasActiveFilters = statusFilter !== 'ALL' || !!dateFilter;

  const formatTime = (time: string) => {
    if (!time) return '—';

    const parts = time.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1] ?? '0');

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return time;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const formatResource = (resourceId: string) => {
    if (!resourceId) return '—';
    if (resourceId.length <= 10) return resourceId;
    return `${resourceId.slice(0, 8)}...`;
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          background: 'rgba(45,122,58,0.10)',
          color: '#2D7A3A',
          borderColor: 'rgba(45,122,58,0.18)',
        };
      case 'PENDING':
        return {
          background: 'rgba(234,179,8,0.10)',
          color: '#A16207',
          borderColor: 'rgba(234,179,8,0.22)',
        };
      case 'REJECTED':
        return {
          background: 'rgba(217,68,68,0.10)',
          color: '#B42318',
          borderColor: 'rgba(217,68,68,0.20)',
        };
      case 'CANCELLED':
        return {
          background: 'rgba(107,123,107,0.10)',
          color: '#5F6F5F',
          borderColor: 'rgba(107,123,107,0.20)',
        };
      default:
        return {
          background: 'rgba(91,140,90,0.08)',
          color: '#2D7A3A',
          borderColor: 'rgba(45,122,58,0.15)',
        };
    }
  };

  const canCancelBooking = (status: string) => {
    return status === 'PENDING' || status === 'APPROVED';
  };

  const canReviewBooking = (status: string) => {
    return status === 'PENDING';
  };

  const openCancelDialog = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setActionErrorMessage('');
    setSuccessMessage('');
    setShowCancelDialog(true);
  };

  const openReviewDialog = (
    booking: BookingResponse,
    action: 'APPROVE' | 'REJECT'
  ) => {
    setSelectedBooking(booking);
    setReviewAction(action);
    setActionErrorMessage('');
    setSuccessMessage('');
    setShowReviewDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    setCancellingBooking(true);
    setActionErrorMessage('');
    setSuccessMessage('');

    try {
      await cancelBooking(selectedBooking.id);

      setShowCancelDialog(false);
      setSelectedBooking(null);
      setSuccessMessage('Booking cancelled successfully.');

      await loadBookings(
        {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          date: dateFilter || undefined,
        },
        true
      );
    } catch (error: any) {
      setActionErrorMessage(
        error?.response?.data?.message || 'Failed to cancel booking.'
      );
    } finally {
      setCancellingBooking(false);
    }
  };

  const handleConfirmReview = async () => {
    if (!selectedBooking || !reviewAction) return;

    setProcessingReviewAction(true);
    setActionErrorMessage('');
    setSuccessMessage('');

    try {
      if (reviewAction === 'APPROVE') {
        await approveBooking(selectedBooking.id);
        setSuccessMessage(`Booking #${selectedBooking.id} approved successfully.`);
      } else {
        await rejectBooking(selectedBooking.id);
        setSuccessMessage(`Booking #${selectedBooking.id} rejected successfully.`);
      }

      setShowReviewDialog(false);
      setSelectedBooking(null);
      setReviewAction(null);

      await loadBookings(
        {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          date: dateFilter || undefined,
        },
        true
      );
    } catch (error: any) {
      setActionErrorMessage(
        error?.response?.data?.message ||
          `Failed to ${reviewAction.toLowerCase()} booking.`
      );
    } finally {
      setProcessingReviewAction(false);
    }
  };

  const bookingsSummary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      approved: bookings.filter((b) => b.status === 'APPROVED').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
      rejected: bookings.filter((b) => b.status === 'REJECTED').length,
    };
  }, [bookings]);

  const pageTitle = isAdmin ? 'Booking Approvals' : 'Facility Bookings';
  const sectionTitle = isAdmin ? 'All Bookings' : 'My Bookings';
  const pageDescription = isAdmin
    ? 'Review booking requests and manage their approval status.'
    : 'View your booking history with current status and details.';
  const sectionDescription = isAdmin
    ? 'Review all booking requests with current status and available admin actions.'
    : 'View your booking history with current status and details.';

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 max-w-[1400px] mx-auto page-enter">
        <div
          className="rounded-xl border border-dashed px-6 py-14 text-center"
          style={{ borderColor: '#DCE5D7', background: '#FBFCFA' }}
        >
          <p
            className="text-[14px]"
            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto page-enter">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 mb-6 group"
        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
      >
        <ArrowLeft
          size={13}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#1A2E1A] transition-colors">
          Dashboard
        </span>
      </Link>

      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
            style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
          >
            {isAdmin ? 'Admin' : 'Campus'}
          </p>
          <h1
            className="font-serif leading-tight mb-1"
            style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
          >
            {pageTitle}
          </h1>
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
          >
            {pageDescription}
          </p>
        </div>

        {!isAdmin && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#2D7A3A] hover:bg-[#256632] text-white"
          >
            <Plus size={16} />
            Add Booking
          </Button>
        )}
      </header>

      {successMessage && (
        <div
          className="rounded-lg px-4 py-3 text-sm mb-4"
          style={{
            background: 'rgba(45,122,58,0.08)',
            border: '1px solid rgba(45,122,58,0.18)',
            color: '#2D7A3A',
            fontFamily: 'Albert Sans, sans-serif',
          }}
        >
          {successMessage}
        </div>
      )}

      {actionErrorMessage && (
        <div
          className="rounded-lg px-4 py-3 text-sm mb-4"
          style={{
            background: 'rgba(217,68,68,0.08)',
            border: '1px solid rgba(217,68,68,0.18)',
            color: '#B42318',
            fontFamily: 'Albert Sans, sans-serif',
          }}
        >
          {actionErrorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bookings', value: bookingsSummary.total },
          { label: 'Pending', value: bookingsSummary.pending },
          { label: 'Approved', value: bookingsSummary.approved },
          {
            label: isAdmin ? 'Rejected' : 'Cancelled',
            value: isAdmin ? bookingsSummary.rejected : bookingsSummary.cancelled,
          },
        ].map((item) => (
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

      <Card className="border-[#E2E8DF] shadow-sm bg-white mb-6">
        <CardHeader className="gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle
                className="font-serif text-[24px]"
                style={{ color: '#1A2E1A' }}
              >
                {sectionTitle}
              </CardTitle>
              <CardDescription
                className="text-[13px]"
                style={{
                  color: '#6B7B6B',
                  fontFamily: 'Albert Sans, sans-serif',
                }}
              >
                {sectionDescription}
              </CardDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              className="border-[#D8E0D4] bg-white"
              disabled={loadingBookings}
            >
              <RefreshCw
                size={14}
                className={loadingBookings ? 'animate-spin' : ''}
              />
              Refresh
            </Button>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ background: '#FBFCFA', borderColor: '#E2E8DF' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[220px_220px_auto] gap-4 items-end">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="flex md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="border-[#D8E0D4] bg-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loadingBookings ? (
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
          ) : bookingsError ? (
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
          ) : bookings.length === 0 ? (
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
          ) : (
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
                          {formatResource(booking.resourceId)}
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
          )}
        </CardContent>
      </Card>

      {!isAdmin && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="!w-[96vw] !max-w-[1200px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
              <div className="p-6 sm:p-8 lg:border-r border-[#E2E8DF]">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <DialogTitle
                      className="font-serif text-[24px]"
                      style={{ color: '#1A2E1A' }}
                    >
                      Create Booking Request
                    </DialogTitle>
                    <DialogDescription
                      className="text-[13px] mt-2"
                      style={{
                        color: '#6B7B6B',
                        fontFamily: 'Albert Sans, sans-serif',
                      }}
                    >
                      Complete the form below to submit your booking request.
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
                          {resources.length === 0 ? (
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
                      onClick={() => setShowForm(false)}
                      className="border-[#D8E0D4] bg-white"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={submittingBooking}
                      className="bg-[#2D7A3A] hover:bg-[#256632] text-white"
                    >
                      {submittingBooking ? 'Submitting...' : 'Submit Booking'}
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
      )}

      {!isAdmin && (
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
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
                    {selectedBooking.resourceId}
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
                onClick={() => setShowCancelDialog(false)}
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
      )}

      {isAdmin && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
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
                    {selectedBooking.resourceId}
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
                onClick={() => setShowReviewDialog(false)}
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
      )}
    </div>
  );
};

export default BookingsPage;