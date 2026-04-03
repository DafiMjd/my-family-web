import { apiClient } from '@/lib/api-client';
import type {
  ClosestRelatedPeopleResponse,
  FamilyChildrenResponse,
  FamilyRootsResponse,
} from '@/types/family-tree';

export const familyTreeService = {
  getRoots: (): Promise<FamilyRootsResponse> =>
    apiClient<FamilyRootsResponse>('/api/family-tree/roots'),
  getChildren: (personId: string): Promise<FamilyChildrenResponse> =>
    apiClient<FamilyChildrenResponse>(`/api/family-tree/${personId}/children?withSpouse=true`),
  getClosestRelatedPeople: (personId: string): Promise<ClosestRelatedPeopleResponse> =>
    apiClient<ClosestRelatedPeopleResponse>(`/api/family-tree/${personId}/closest-related-people`),
};
