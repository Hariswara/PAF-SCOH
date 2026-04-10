import api from '@/lib/api';
import type { ResourceResponse } from '../types/resource';

export const getResources = async () => {
  const response = await api.get<ResourceResponse[]>('/resources');
  return response.data;
};


