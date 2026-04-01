import { useQuery } from '@tanstack/react-query';
import { familyTreeService } from '@/services/family-tree.service';

export const familyRootsQueryKey = ['family-tree', 'roots'] as const;

export function useFamilyRoots() {
  return useQuery({
    queryKey: familyRootsQueryKey,
    queryFn: familyTreeService.getRoots,
    staleTime: 5 * 60 * 1000,
  });
}
