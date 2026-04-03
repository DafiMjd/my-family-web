import { useQuery } from '@tanstack/react-query';
import { familyTreeService } from '@/services/family-tree.service';

export function closestRelatedPeopleQueryKey(personId: string) {
  return ['family-tree', 'closest-related-people', personId] as const;
}

export function useClosestRelatedPeople(personId: string, enabled: boolean) {
  return useQuery({
    queryKey: closestRelatedPeopleQueryKey(personId),
    queryFn: () => familyTreeService.getClosestRelatedPeople(personId),
    enabled: enabled && Boolean(personId),
    staleTime: 5 * 60 * 1000,
  });
}
