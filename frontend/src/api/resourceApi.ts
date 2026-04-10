import type { ResourceDTO, ResourceResponse } from '../types/resource';

const BASE_URL = '/api/v1';

function getCsrfToken(): string {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1] || '';
}

export async function createResource(data: ResourceDTO): Promise<ResourceResponse> {
  const response = await fetch(`${BASE_URL}/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': getCsrfToken()
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}

export async function getResources(params?: {
  name?: string;
  location?: string;
  capacity?: number;
  type?: string;
}): Promise<ResourceResponse[]> {
  const query = new URLSearchParams();
  if (params?.name) query.append('name', params.name);
  if (params?.location) query.append('location', params.location);
  if (params?.capacity) query.append('capacity', String(params.capacity));
  if (params?.type) query.append('type', params.type);

  const url = query.toString()
    ? `${BASE_URL}/resources?${query.toString()}`
    : `${BASE_URL}/resources`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch resources');
  return response.json();
}

export async function updateResource(
  id: string,
  data: ResourceDTO
): Promise<ResourceResponse> {
  const response = await fetch(`${BASE_URL}/resources/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}