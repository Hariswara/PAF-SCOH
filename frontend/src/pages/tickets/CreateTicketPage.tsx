import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ticketApi } from '@/lib/ticketApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DuplicateSidebar } from '@/components/tickets/DuplicateSidebar';
import { AttachmentUploader } from '@/components/tickets/AttachmentUploader';
import { toast } from 'sonner';
import type { TicketCategory, TicketPriority, DuplicateSuggestion } from '@/types/ticket';

const CATEGORIES: { value: TicketCategory; label: string }[] = [
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'HVAC', label: 'HVAC / Air Conditioning' },
    { value: 'EQUIPMENT', label: 'Equipment / Hardware' },
    { value: 'NETWORK', label: 'Network / Connectivity' },
    { value: 'OTHER', label: 'Other' },
];

const PRIORITIES: { value: TicketPriority; label: string; hint: string }[] = [
    { value: 'LOW', label: 'Low', hint: 'Minor inconvenience, can wait.' },
    { value: 'MEDIUM', label: 'Medium', hint: 'Affects work, needs timely resolution.' },
    { value: 'HIGH', label: 'High', hint: 'Significantly impacts operations.' },
    { value: 'CRITICAL', label: 'Critical', hint: 'Immediate danger or total blockage.' },
];

const CreateTicketPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        location: '',
        category: '' as TicketCategory | '',
        description: '',
        priority: '' as TicketPriority | '',
        preferredContact: user?.email ?? '',
        resourceId: '',
    });
    const [linkedTicketId, setLinkedTicketId] = useState<string | undefined>(undefined);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Duplicate detection
    const [suggestions, setSuggestions] = useState<DuplicateSuggestion[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (form.description.trim().length < 10) { setSuggestions([]); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await ticketApi.checkDuplicates(form.description);
                setSuggestions(results);
            } catch { /* silently ignore */ }
        }, 600);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [form.description]);

    const handleChange = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSelectChange = (field: keyof typeof form) => (value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.category || !form.priority) {
            setError('Please select a category and priority.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const ticket = await ticketApi.create({
                location: form.location,
                category: form.category as TicketCategory,
                description: form.description,
                priority: form.priority as TicketPriority,
                preferredContact: form.preferredContact,
                resourceId: form.resourceId || undefined,
                linkedTicketId,
            });

            // Upload attachments sequentially
            for (const file of pendingFiles) {
                try {
                    await ticketApi.uploadAttachment(ticket.id, file);
                } catch {
                    toast.error(`Failed to upload ${file.name}. You can add it from the ticket detail page.`);
                }
            }

            toast.success('Ticket submitted successfully.');
            navigate(`/tickets/${ticket.id}`);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to submit ticket. Please try again.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
            <header className="bg-primary text-primary-foreground py-8 px-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <Link
                        to="/tickets"
                        className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors flex items-center mb-4"
                    >
                        <span className="mr-2">←</span> Return to Tickets
                    </Link>
                    <h1 className="text-4xl font-serif mb-2">Report an Incident</h1>
                    <p className="text-primary-foreground/70 font-light max-w-xl text-sm">
                        Provide accurate details so technicians can address the issue efficiently.
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form — 2 cols */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
                    {error && (
                        <div className="p-4 bg-destructive/5 border-l-4 border-destructive text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Location */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Location *
                        </Label>
                        <Input
                            placeholder="e.g. Lab 301, Building A, 3rd Floor"
                            value={form.location}
                            onChange={handleChange('location')}
                            required
                            className="h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base"
                        />
                    </div>

                    {/* Resource ID placeholder */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Resource ID <span className="normal-case font-normal text-muted-foreground/60">(optional — Module A placeholder)</span>
                        </Label>
                        <Input
                            placeholder="Will be a dropdown once Module A is integrated"
                            value={form.resourceId}
                            onChange={handleChange('resourceId')}
                            className="h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base"
                        />
                    </div>

                    {/* Category & Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                Category *
                            </Label>
                            <Select value={form.category} onValueChange={handleSelectChange('category')} required>
                                <SelectTrigger className="w-full h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                Priority *
                            </Label>
                            <Select value={form.priority} onValueChange={handleSelectChange('priority')} required>
                                <SelectTrigger className="w-full h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            <span className="font-bold">{p.label}</span>
                                            <span className="text-muted-foreground ml-1 text-xs">— {p.hint}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Description *
                        </Label>
                        <Textarea
                            placeholder="Describe the issue in detail. Be specific about what is broken, the symptoms, and when it started."
                            value={form.description}
                            onChange={handleChange('description')}
                            required
                            minLength={10}
                            rows={5}
                        />
                        <p className="text-[10px] text-muted-foreground">Minimum 10 characters.</p>
                    </div>

                    {/* Preferred Contact */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Preferred Contact *
                        </Label>
                        <Input
                            placeholder="e.g. your email or phone number"
                            value={form.preferredContact}
                            onChange={handleChange('preferredContact')}
                            required
                            className="h-12 bg-transparent border-0 border-b-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base"
                        />
                    </div>

                    {/* Attachment Uploader */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Evidence Images <span className="normal-case font-normal text-muted-foreground/60">(up to 3)</span>
                        </Label>
                        <AttachmentUploader
                            pendingFiles={pendingFiles}
                            onFilesChange={setPendingFiles}
                            maxFiles={3}
                        />
                    </div>

                    {/* Linked ticket notice */}
                    {linkedTicketId && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
                            Your report will be linked to an existing ticket. The assigned technician will be notified of the additional impact.
                            <button
                                type="button"
                                className="ml-2 underline text-xs"
                                onClick={() => setLinkedTicketId(undefined)}
                            >
                                Unlink
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-border">
                        <Link
                            to="/tickets"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium flex items-center"
                        >
                            <span className="mr-2">←</span> Cancel
                        </Link>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 px-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest uppercase text-xs"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                    </div>
                </form>

                {/* Duplicate sidebar — 1 col */}
                <aside className="lg:col-span-1">
                    <DuplicateSidebar
                        suggestions={suggestions}
                        onLink={(id) => setLinkedTicketId(id)}
                        linkedId={linkedTicketId}
                    />
                </aside>
            </div>
        </div>
    );
};

export default CreateTicketPage;