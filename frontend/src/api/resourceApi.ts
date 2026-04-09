import type { ResourceDTO, ResourceResponse } from '../types/resource';

const BASE_URL = '/api/v1';

export async function createResource(data: ResourceDTO): Promise<ResourceResponse> {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  const response = await fetch(`${BASE_URL}/resources`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken || ''
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