
import api from '@/lib/api';
import type {
    CreateResourceRequest,
    ResourceResponse,
    ResourceSearchParams,
    UpdateResourceRequest,
    UpdateResourceStatusRequest,
} from '@/types/resource';

export const resourceApi = {
    getAll: () =>
        api.get<ResourceResponse[]>('/resources').then((r) => r.data),

    getById: (id: string) =>
        api.get<ResourceResponse>(`/resources/${id}`).then((r) => r.data),

    search: (params: ResourceSearchParams) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
        });
        return api
            .get<ResourceResponse[]>(`/resources/search?${query}`)
            .then((r) => r.data);
    },

    create: (data: CreateResourceRequest) =>
        api.post<ResourceResponse>('/resources', data).then((r) => r.data),

    update: (id: string, data: UpdateResourceRequest) =>
        api.put<ResourceResponse>(`/resources/${id}`, data).then((r) => r.data),

    updateStatus: (id: string, data: UpdateResourceStatusRequest) =>
        api
            .patch<ResourceResponse>(`/resources/${id}/status`, data)
            .then((r) => r.data),

    delete: (id: string) => api.delete(`/resources/${id}`),
};