'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyRoots } from '@/hooks/use-family-roots';
import { usePersonSearch } from '@/hooks/use-person-search';
import { FamilyRootCard } from '@/app/components/FamilyRootCard';
import { PersonDetailModal } from '@/app/components/PersonDetailModal';
import { serializeParentPeople, toPeopleFromRoot } from '@/lib/family-navigation';
import type { Person } from '@/types/family-tree';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-2 flex flex-col gap-2 shadow-sm animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-200" />
        </div>
        <div className="w-6 h-6 rounded bg-gray-200" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-2 w-10 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-2 w-20 rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-px w-full bg-gray-100" />
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-2 w-8 rounded bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-2 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useFamilyRoots();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const {
    data: searchInfiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = usePersonSearch(debouncedSearchInput);
  const isSearchActive = debouncedSearchInput.trim().length >= 3;
  const searchPeople =
    searchInfiniteData?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    if (!isSearchActive) {
      return;
    }
    const node = loadMoreRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '120px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isSearchActive, hasNextPage, isFetchingNextPage, fetchNextPage, searchPeople.length]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-medium text-red-500">Gagal memuat data</p>
        <p className="text-xs text-gray-400">{error.message}</p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-1 px-4 py-2 rounded-lg bg-[#242424] text-white text-sm font-sora font-semibold disabled:opacity-50 active:scale-95 transition-transform"
        >
          {isFetching ? 'Memuat...' : 'Coba Lagi'}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col pt-8 gap-3 p-4">
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search person name..."
          className="w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#242424] outline-none focus:border-[#242424]"
        />

        {searchInput.trim().length > 0 && searchInput.trim().length < 3 ? (
          <p className="text-xs text-[#909090] font-sora">Type at least 3 characters to search.</p>
        ) : null}

        {isSearchActive ? (
          <>
            {isSearchLoading ? <p className="text-sm text-[#909090] font-sora">Searching...</p> : null}

            {isSearchError ? (
              <p className="text-sm text-red-500 font-sora">{searchError.message}</p>
            ) : null}

            {!isSearchLoading && !isSearchError && searchPeople.length === 0 ? (
              <p className="text-sm text-[#909090] font-sora">No person found.</p>
            ) : null}

            {!isSearchLoading && !isSearchError
              ? searchPeople.map((person) => (
                  <FamilyRootCard
                    key={person.id}
                    people={[person]}
                    isTappable
                    onTap={(tappedPerson) => setSelectedPerson(tappedPerson)}
                  />
                ))
              : null}

            {isSearchActive && !isSearchError ? (
              <div ref={loadMoreRef} className="h-1 w-full shrink-0" aria-hidden />
            ) : null}

            {isFetchingNextPage ? (
              <p className="text-xs text-[#909090] font-sora text-center">Loading more...</p>
            ) : null}
          </>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          data?.data.map((root) => {
            const people = toPeopleFromRoot(root);
            return (
              <FamilyRootCard
                key={root.father?.id ?? root.mother?.id}
                people={people}
                isTappable={people.length > 0}
                onTap={(person) => {
                  if (root.isMarried) {
                    const payload = serializeParentPeople(root);
                    router.push(`/family/${person.id}?parent=${payload}`);
                    return;
                  }
                  setSelectedPerson(person);
                }}
              />
            );
          })
        )}
      </div>

      <PersonDetailModal
        person={selectedPerson}
        isOpen={Boolean(selectedPerson)}
        onClose={() => setSelectedPerson(null)}
      />
    </>
  );
}
