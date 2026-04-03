import { apiClient } from '@/lib/api-client';
import type { ChildrenResponse, FamilyRootsResponse } from '@/types/family-tree';

export const familyTreeService = {
  getRoots: (): Promise<FamilyRootsResponse> =>
    apiClient<FamilyRootsResponse>('/api/family-tree/roots'),

  getChildren: (personId: string): Promise<ChildrenResponse> =>
    apiClient<ChildrenResponse>(`/api/family-tree/${personId}/children?withSpouse=true`),
};
