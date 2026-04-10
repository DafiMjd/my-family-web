import { useQuery } from '@tanstack/react-query';
import { familyTreeService } from '@/services/family-tree.service';

export type FamilyChildrenParentParams = { fatherId?: string; motherId?: string };

export function familyChildrenQueryKey(params: FamilyChildrenParentParams) {
  return ['family-tree', 'children', params.fatherId ?? '', params.motherId ?? ''] as const;
}

export function useFamilyChildren(params: FamilyChildrenParentParams) {
  const hasFather = Boolean(params.fatherId?.trim());
  const hasMother = Boolean(params.motherId?.trim());
  const hasAtLeastOne = hasFather || hasMother;

  return useQuery({
    queryKey: familyChildrenQueryKey(params),
    queryFn: () => familyTreeService.getChildren(params),
    enabled: hasAtLeastOne,
    staleTime: 5 * 60 * 1000,
  });
}
