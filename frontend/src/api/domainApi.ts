import type { Domain } from '../types/domain';

export async function getDomains(): Promise<Domain[]> {
  const response = await fetch('/api/domains', {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch domains');
  return response.json();
}