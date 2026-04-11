
export type ResourceType =
    | 'LECTURE_HALL'
    | 'LAB'
    | 'MEETING_ROOM'
    | 'EQUIPMENT'
    | 'OTHER';

export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';

export interface ResourceResponse {
    id: string;
    domainId: string;
    domainName: string | null;
    resourceType: ResourceType;
    name: string;
    description: string | null;
    location: string;
    capacity: number | null;
    status: ResourceStatus;
    metadata: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateResourceRequest {
    domainId: string;
    resourceType: ResourceType;
    name: string;
    description?: string;
    location: string;
    capacity?: number;
    metadata?: string;
}

export interface UpdateResourceRequest {
    resourceType: ResourceType;
    name: string;
    description?: string;
    location: string;
    capacity?: number;
    metadata?: string;
}

export interface UpdateResourceStatusRequest {
    status: ResourceStatus;
}

export interface ResourceSearchParams {
    domainId?: string;
    resourceType?: string;
    status?: string;
    minCapacity?: number;
    location?: string;
    query?: string;
}