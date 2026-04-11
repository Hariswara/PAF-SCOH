
import type {
    CreateResourceRequest,
    ResourceResponse,
    ResourceSearchParams,
    UpdateResourceRequest,
    UpdateResourceStatusRequest,
} from '@/types/resource';

const BASE = '/api/resources';

async function handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? res.statusText);
    }
    return res.json() as Promise<T>;
}

export const resourceApi = {
    getAll: () =>
        fetch(BASE, { credentials: 'include' }).then(handle<ResourceResponse[]>),

    getById: (id: string) =>
        fetch(`${BASE}/${id}`, { credentials: 'include' }).then(handle<ResourceResponse>),

    search: (params: ResourceSearchParams) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) qs.set(k, String(v));
        });
        return fetch(`${BASE}/search?${qs}`, { credentials: 'include' })
            .then(handle<ResourceResponse[]>);
    },

    create: (data: CreateResourceRequest) =>
        fetch(BASE, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handle<ResourceResponse>),

    update: (id: string, data: UpdateResourceRequest) =>
        fetch(`${BASE}/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handle<ResourceResponse>),

    updateStatus: (id: string, data: UpdateResourceStatusRequest) =>
        fetch(`${BASE}/${id}/status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handle<ResourceResponse>),

    delete: (id: string) =>
        fetch(`${BASE}/${id}`, { method: 'DELETE', credentials: 'include' })
            .then(res => { if (!res.ok) throw new Error(res.statusText); }),
};