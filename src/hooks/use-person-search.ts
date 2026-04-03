import { useInfiniteQuery } from '@tanstack/react-query';
import { familyTreeService } from '@/services/family-tree.service';

export const PERSON_SEARCH_LIMIT = 10;

export function personSearchQueryKey(name: string) {
  return ['person', 'search', name] as const;
}

export function usePersonSearch(name: string) {
  const normalizedName = name.trim();
  const canSearch = normalizedName.length >= 3;

  return useInfiniteQuery({
    queryKey: personSearchQueryKey(normalizedName),
    queryFn: ({ pageParam }) =>
      familyTreeService.searchPeopleByName(normalizedName, pageParam, PERSON_SEARCH_LIMIT),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const nextOffset = lastPageParam + lastPage.data.length;
      if (lastPage.data.length < PERSON_SEARCH_LIMIT || nextOffset >= lastPage.count) {
        return undefined;
      }
      return nextOffset;
    },
    enabled: canSearch,
    staleTime: 60 * 1000,
  });
}
