import { useState, useEffect, useCallback } from 'react';
import { ticketApi } from '@/lib/ticketApi';
import type { TicketResponse } from '@/types/ticket';

export function useMyTickets() {
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ticketApi.getMine();
            setTickets(data);
        } catch {
            setError('Failed to load tickets.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { tickets, isLoading, error, refetch: fetch };
}

export function useAllTickets() {
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ticketApi.getAll();
            setTickets(data);
        } catch {
            setError('Failed to load tickets.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { tickets, isLoading, error, refetch: fetch };
}

export function useAssignedTickets() {
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ticketApi.getAssigned();
            setTickets(data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return { tickets, isLoading, refetch: fetch };
}

export function useTicket(id: string) {
    const [ticket, setTicket] = useState<TicketResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await ticketApi.getById(id);
            setTicket(data);
        } catch {
            setError('Ticket not found.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetch(); }, [fetch]);

    return { ticket, isLoading, error, refetch: fetch };
}