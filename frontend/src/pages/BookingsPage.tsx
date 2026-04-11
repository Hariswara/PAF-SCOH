import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ResourceResponse } from '@/types/resource';
import type { BookingResponse } from '@/types/booking';
import { bookingApi } from '@/lib/bookingApi';
import BookingSummaryCards from '../components/bookings/BookingSummaryCards';
import BookingFilters from '../components/bookings/BookingFilters';
import BookingTable from '../components/bookings/BookingTable';
import BookingFormDialog from '../components/bookings/BookingFormDialog';
import CancelBookingDialog from '../components/bookings/CancelBookingDialog';
import ReviewBookingDialog from '../components/bookings/ReviewBookingDialog';

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
      await bookingApi.create({
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
      const mockResources: ResourceResponse[] = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          domainId: 'domain-1',
          domainName: 'Computing',
          resourceType: 'LECTURE_HALL',
          name: 'Lecture Hall A',
          description: 'Main lecture hall',
          location: 'Block A - Floor 1',
          capacity: 120,
          status: 'ACTIVE',
          metadata: null,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          domainId: 'domain-1',
          domainName: 'Computing',
          resourceType: 'LAB',
          name: 'Computer Lab 1',
          description: 'Lab for practical sessions',
          location: 'Block B - Floor 2',
          capacity: 40,
          status: 'ACTIVE',
          metadata: null,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          domainId: 'domain-2',
          domainName: 'Business',
          resourceType: 'MEETING_ROOM',
          name: 'Meeting Room 2',
          description: 'Small discussion room',
          location: 'Admin Building',
          capacity: 12,
          status: 'ACTIVE',
          metadata: null,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setResources(mockResources);
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
        ? await bookingApi.getAll(filters)
        : await bookingApi.getMine(filters);

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
    void loadResources();
  }, [isLoading]);

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

  const getResourceName = (resourceId: string) => {
    const resource = resources.find((item) => item.id === resourceId);
    return resource?.name || formatResource(resourceId);
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
      await bookingApi.cancel(selectedBooking.id);

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
        await bookingApi.approve(selectedBooking.id);
        setSuccessMessage(`Booking #${selectedBooking.id} approved successfully.`);
      } else {
        await bookingApi.reject(selectedBooking.id);
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

      <BookingSummaryCards
        isAdmin={isAdmin}
        total={bookingsSummary.total}
        pending={bookingsSummary.pending}
        approved={bookingsSummary.approved}
        cancelled={bookingsSummary.cancelled}
        rejected={bookingsSummary.rejected}
      />

      <Card className="border-[#E2E8DF] shadow-sm bg-white mb-6">
        <CardHeader className="gap-4">
          <BookingFilters
            statusFilter={statusFilter}
            dateFilter={dateFilter}
            setStatusFilter={setStatusFilter}
            setDateFilter={setDateFilter}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            handleRefresh={handleRefresh}
            loadingBookings={loadingBookings}
            title={sectionTitle}
            description={sectionDescription}
          />
        </CardHeader>

        <CardContent>
          <BookingTable
            bookings={bookings}
            isAdmin={isAdmin}
            hasActiveFilters={hasActiveFilters}
            loadingBookings={loadingBookings}
            bookingsError={bookingsError}
            getResourceName={getResourceName}
            formatTimeRange={formatTimeRange}
            canCancelBooking={canCancelBooking}
            canReviewBooking={canReviewBooking}
            getStatusBadgeStyles={getStatusBadgeStyles}
            openCancelDialog={openCancelDialog}
            openReviewDialog={openReviewDialog}
          />
        </CardContent>
      </Card>

      {!isAdmin && (
        <BookingFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          resourceId={resourceId}
          setResourceId={setResourceId}
          resources={resources}
          loadingResources={loadingResources}
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          purpose={purpose}
          setPurpose={setPurpose}
          expectedAttendees={expectedAttendees}
          setExpectedAttendees={setExpectedAttendees}
          errors={errors}
          errorMessage={errorMessage}
          resetForm={resetForm}
          handleSubmit={handleSubmit}
          submittingBooking={submittingBooking}
          selectedResource={selectedResource}
          today={today}
        />
      )}

      {!isAdmin && (
        <CancelBookingDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          selectedBooking={selectedBooking}
          cancellingBooking={cancellingBooking}
          handleConfirmCancel={handleConfirmCancel}
          formatTimeRange={formatTimeRange}
          getResourceName={getResourceName}
        />
      )}

      {isAdmin && (
        <ReviewBookingDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          selectedBooking={selectedBooking}
          reviewAction={reviewAction}
          processingReviewAction={processingReviewAction}
          handleConfirmReview={handleConfirmReview}
          formatTimeRange={formatTimeRange}
          getResourceName={getResourceName}
        />
      )}
    </div>
  );
};

export default BookingsPage;