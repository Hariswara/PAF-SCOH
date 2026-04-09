import React, { useRef } from 'react';
import { UploadIcon, XIcon, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    pendingFiles: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles: number;
    // For existing attachments on the detail page
    existingUrls?: { id: string; filename: string; publicUrl: string }[];
    onDeleteExisting?: (id: string) => void;
}

export const AttachmentUploader: React.FC<Props> = ({
    pendingFiles,
    onFilesChange,
    maxFiles,
    existingUrls = [],
    onDeleteExisting,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const totalCount = existingUrls.length + pendingFiles.length;

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const allowed = maxFiles - totalCount;
        if (allowed <= 0) return;
        const selected = Array.from(files).slice(0, allowed);
        const imageOnly = selected.filter((f) =>
            ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
        );
        onFilesChange([...pendingFiles, ...imageOnly]);
    };

    const removePending = (index: number) => {
        const updated = [...pendingFiles];
        updated.splice(index, 1);
        onFilesChange(updated);
    };

    return (
        <div className="space-y-3">
            {/* Existing attachments */}
            {existingUrls.map((a) => (
                <div key={a.id} className="flex items-center gap-3 bg-muted/30 border border-border p-3">
                    <a href={a.publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
                        <ImageIcon className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-xs text-primary truncate font-medium">{a.filename}</span>
                    </a>
                    {onDeleteExisting && (
                        <button
                            type="button"
                            onClick={() => onDeleteExisting(a.id)}
                            className="text-destructive hover:text-destructive/70 transition-colors"
                        >
                            <XIcon className="size-4" />
                        </button>
                    )}
                </div>
            ))}

            {/* Pending files */}
            {pendingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/5 border border-secondary/30 p-3">
                    <ImageIcon className="size-4 text-secondary shrink-0" />
                    <span className="text-xs text-primary flex-1 truncate font-medium">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => removePending(i)} className="text-destructive hover:text-destructive/70">
                        <XIcon className="size-4" />
                    </button>
                </div>
            ))}

            {/* Upload trigger */}
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
                        className="w-full border-2 border-dashed border-border hover:border-secondary transition-colors p-6 flex flex-col items-center gap-2 group"
                    >
                        <UploadIcon className="size-6 text-muted-foreground group-hover:text-secondary transition-colors" />
                        <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                            Click to upload ({totalCount}/{maxFiles} images) — JPEG, PNG, WEBP, GIF
                        </p>
                    </button>
                </>
            )}
        </div>
    );
};