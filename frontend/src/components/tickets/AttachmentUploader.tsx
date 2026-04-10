import React, { useRef } from 'react';
import { UploadIcon, XIcon, ImageIcon } from 'lucide-react';

interface Props {
    pendingFiles: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles: number;
    existingUrls?: { id: string; filename: string; publicUrl: string }[];
    onDeleteExisting?: (id: string) => void;
    onError?: (message: string) => void;
}

export const AttachmentUploader: React.FC<Props> = ({
    pendingFiles,
    onFilesChange,
    maxFiles,
    existingUrls = [],
    onDeleteExisting,
    onError,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const totalCount = existingUrls.length + pendingFiles.length;

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        // Fix #7 — validate total count before accepting new files
        const incoming = Array.from(files);
        if (totalCount + incoming.length > maxFiles) {
            onError?.(
                `You can attach at most ${maxFiles} image${maxFiles > 1 ? 's' : ''} per ticket. ` +
                `You already have ${totalCount} — remove some before adding more.`,
            );
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        const imageOnly = incoming.filter((f) =>
            ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type),
        );
        onFilesChange([...pendingFiles, ...imageOnly]);
        if (inputRef.current) inputRef.current.value = '';
    };

    const removePending = (index: number) => {
        const updated = [...pendingFiles];
        updated.splice(index, 1);
        onFilesChange(updated);
    };

    return (
        <div className="space-y-2">

            {/* Existing attachments */}
            {existingUrls.map((a) => (
                <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-md"
                    style={{ background: '#F2F5F0', border: '1px solid #E2E8DF' }}
                >
                    <a
                        href={a.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 flex-1 min-w-0"
                    >
                        <ImageIcon size={14} style={{ color: '#6B7B6B', flexShrink: 0 }} />
                        <span
                            className="text-[12px] truncate"
                            style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            {a.filename}
                        </span>
                    </a>
                    {onDeleteExisting && (
                        <button
                            type="button"
                            onClick={() => onDeleteExisting(a.id)}
                            style={{ color: '#D94444' }}
                            className="transition-opacity hover:opacity-70 shrink-0"
                            aria-label="Remove attachment"
                        >
                            <XIcon size={14} />
                        </button>
                    )}
                </div>
            ))}

            {/* Pending (not-yet-uploaded) files */}
            {pendingFiles.map((f, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-md"
                    style={{ background: 'rgba(45,122,58,0.04)', border: '1px solid rgba(45,122,58,0.2)' }}
                >
                    <ImageIcon size={14} style={{ color: '#2D7A3A', flexShrink: 0 }} />
                    <span
                        className="text-[12px] flex-1 truncate"
                        style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                        {f.name}
                    </span>
                    <span
                        className="text-[10px] shrink-0"
                        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                        {(f.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                        type="button"
                        onClick={() => removePending(i)}
                        style={{ color: '#D94444' }}
                        className="transition-opacity hover:opacity-70 shrink-0"
                        aria-label="Remove pending file"
                    >
                        <XIcon size={14} />
                    </button>
                </div>
            ))}

            {/* Upload trigger — hidden when limit reached */}
            {totalCount < maxFiles && (
                <>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="w-full flex flex-col items-center gap-2 p-6 rounded-md border-2 border-dashed transition-colors"
                        style={{ borderColor: '#E2E8DF' }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#5B8C5A')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8DF')}
                    >
                        <UploadIcon size={18} style={{ color: '#6B7B6B' }} />
                        <p
                            className="text-[12px]"
                            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            Click to upload ({totalCount}/{maxFiles}) — JPEG, PNG, WEBP, GIF
                        </p>
                    </button>
                </>
            )}
        </div>
    );
};