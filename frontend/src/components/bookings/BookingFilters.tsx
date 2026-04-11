import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  statusFilter: string;
  dateFilter: string;
  setStatusFilter: (value: string) => void;
  setDateFilter: (value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  handleRefresh: () => void;
  loadingBookings: boolean;
  title: string;
  description: string;
};

const BookingFilters: React.FC<Props> = ({
  statusFilter,
  dateFilter,
  setStatusFilter,
  setDateFilter,
  clearFilters,
  hasActiveFilters,
  handleRefresh,
  loadingBookings,
  title,
  description,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2
            className="font-serif text-[24px]"
            style={{ color: '#1A2E1A' }}
          >
            {title}
          </h2>
          <p
            className="text-[13px]"
            style={{
              color: '#6B7B6B',
              fontFamily: 'Albert Sans, sans-serif',
            }}
          >
            {description}
          </p>
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
    </>
  );
};

export default BookingFilters;