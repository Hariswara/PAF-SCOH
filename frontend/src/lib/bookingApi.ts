import api from '@/lib/api';
import type {
  BookingResponse,
  BookingFilters,
  CreateBookingRequest,
  UpdateBookingRequest,
} from '@/types/booking';

export const bookingApi = {
  create: (data: CreateBookingRequest) =>
    api.post<BookingResponse>('/bookings', data).then((r) => r.data),

  update: (id: number, data: UpdateBookingRequest) =>
    api.put<BookingResponse>(`/bookings/${id}`, data).then((r) => r.data),

  getAll: (filters?: BookingFilters) =>
    api.get<BookingResponse[]>('/bookings', { params: filters }).then((r) => r.data),

  getMine: (filters?: BookingFilters) =>
    api.get<BookingResponse[]>('/bookings/my', { params: filters }).then((r) => r.data),

  cancel: (id: number) =>
    api.patch(`/bookings/${id}/cancel`).then((r) => r.data),

  approve: (id: number) =>
    api.patch(`/bookings/${id}/review`, { status: 'APPROVED' }).then((r) => r.data),

  reject: (id: number) =>
    api.patch(`/bookings/${id}/review`, { status: 'REJECTED' }).then((r) => r.data),
};