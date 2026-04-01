import { apiClient } from '@/lib/api-client';
import type { FamilyRootsResponse } from '@/types/family-tree';

export const familyTreeService = {
  getRoots: (): Promise<FamilyRootsResponse> =>
    apiClient<FamilyRootsResponse>('/api/family-tree/roots'),
};
