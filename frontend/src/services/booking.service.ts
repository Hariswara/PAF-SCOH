import api from '@/lib/api';

export interface CreateBookingRequest {
  resourceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
}

export interface BookingResponse {
  id: number;
  resourceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  status: string;
}

// STUDENT
export const getMyBookings = async (filters?: {
  status?: string;
  date?: string;
}) => {
  const response = await api.get('/bookings/my', {
    params: filters,
  });
  return response.data;
};

// ADMIN
export const getBookings = async (filters?: {
  status?: string;
  date?: string;
}) => {
  const response = await api.get('/bookings', {
    params: filters,
  });
  return response.data;
};

export const createBooking = async (data: CreateBookingRequest) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const cancelBooking = async (id: number) => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};

export const approveBooking = async (id: number) => {
  const response = await api.patch(`/bookings/${id}/review`, {
    status: 'APPROVED',
  });
  return response.data;
};

export const rejectBooking = async (id: number) => {
  const response = await api.patch(`/bookings/${id}/review`, {
    status: 'REJECTED',
  });
  return response.data;
};