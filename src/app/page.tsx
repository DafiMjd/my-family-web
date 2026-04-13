'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyRootCard } from '@/app/components/FamilyRootCard';
import { useFamilyChildren } from '@/hooks/use-family-children';
import { useFamilyRoots } from '@/hooks/use-family-roots';
import type { Person, PersonWithSpouse } from '@/types/family-tree';
import { usePersonSearch } from '@/hooks/use-person-search';
import { PersonDetailModal } from './components/PersonDetailModal';

function toCardPeople(child: PersonWithSpouse): Person[] {
  return child.spouse ? [child, child.spouse] : [child];
}

function FamilyBranch({
  fatherId,
  motherId,
  depth = 1,
}: {
  fatherId?: string | null;
  motherId?: string | null;
  depth?: number;
}) {
  const [openedChildren, setOpenedChildren] = useState<Record<string, boolean>>({});
  const parentQuery = useMemo(() => {
    const q: { fatherId?: string; motherId?: string } = {};
    if (fatherId) q.fatherId = fatherId;
    if (motherId) q.motherId = motherId;
    return q;
  }, [fatherId, motherId]);
  const { data, isLoading, isError } = useFamilyChildren(parentQuery);
  const children = data?.data ?? [];

  const visibleChildren = useMemo(
    () => children.filter((child) => toCardPeople(child).length > 0),
    [children],
  );

  if (isLoading) {
    return <p className="text-sm text-[#909090] font-sora">Memuat data anak...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500 font-sora">Gagal memuat data anak.</p>;
  }

  if (visibleChildren.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {visibleChildren.map((child, index) => {
        const people = toCardPeople(child);
        const father = people.find((item) => item.gender === 'MAN');
        const mother = people.find((item) => item.gender === 'WOMAN');
        const branchKey = `${child.id}-${child.spouse?.id ?? 'no-spouse'}-${depth}`;
        const isOpen = Boolean(openedChildren[branchKey]);
        const isFirst = index === 0;
        const isLast = index === visibleChildren.length - 1;

        return (
          <div key={branchKey} className="relative">
            <div className="flex items-stretch gap-4">
              <div className="relative self-stretch pl-4 pt-2">
                {index === 0 ? (
                  <div className="absolute left-[-16px] top-8 h-px w-4 bg-[#D8D8D8]" />
                ) : null}
                {visibleChildren.length > 1 ? (
                  <div
                    className={`absolute left-0 w-px bg-[#D8D8D8] ${isFirst ? 'top-8 bottom-0' : isLast ? 'top-0 h-8' : 'top-0 bottom-0'
                      }`}
                  />
                ) : null}

                <div className="absolute left-0 top-8 h-px w-4 bg-[#D8D8D8]" />
                <FamilyRootCard
                  people={people}
                  endMarriageDate={child.endMarriageDate}
                  isTappable
                  onTap={(_person, _people) => {
                    setOpenedChildren((prev) => ({
                      ...prev,
                      [branchKey]: !prev[branchKey],
                    }));
                  }}
                />
              </div>

              {isOpen ? (
                <div className="pt-2">
                  {father || mother ? (
                    <FamilyBranch fatherId={father?.id ?? null} motherId={mother?.id ?? null} depth={depth + 1} />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { data, isLoading, isError } = useFamilyRoots();
  const [openedRoots, setOpenedRoots] = useState<Record<string, boolean>>({});

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');

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

  function toggleRootBranch(rootKey: string) {
    setOpenedRoots((prev) => ({
      ...prev,
      [rootKey]: !prev[rootKey],
    }));
  }

  function handleOpenAddRoute(path: '/add-person' | '/add-family' | '/marriage' | '/add-family-children') {
    router.push(path);
  }

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="flex flex-col px-4">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari nama orang..."
            className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 mt-10 text-base text-[#242424] outline-none focus:border-[#242424]"
          />

          {searchInput.trim().length > 0 && searchInput.trim().length < 3 ? (
            <p className="text-xs pt-2 text-[#909090] font-sora">Ketik minimal 3 karakter untuk mencari.</p>
          ) : null}
        </div>

        {isSearchActive ? (
          <div className="flex flex-col p-4 gap-2">
            {isSearchLoading ? <p className="text-sm text-[#909090] font-sora">Mencari...</p> : null}

            {isSearchError ? (
              <p className="text-sm text-red-500 font-sora">{searchError.message}</p>
            ) : null}

            {!isSearchLoading && !isSearchError && searchPeople.length === 0 ? (
              <p className="text-sm text-[#909090] font-sora">Orang tidak ditemukan.</p>
            ) : null}

            {!isSearchLoading && !isSearchError
              ? searchPeople.map((person) => (
                <FamilyRootCard
                  key={person.id}
                  people={[person]}
                  endMarriageDate={null}
                  isTappable
                  onTap={(tappedPerson) => setSelectedPerson(tappedPerson)}
                />
              ))
              : null}

            {isSearchActive && !isSearchError ? (
              <div ref={loadMoreRef} className="h-1 w-full shrink-0" aria-hidden />
            ) : null}

            {isFetchingNextPage ? (
              <p className="text-xs text-[#909090] font-sora text-center">Memuat lebih banyak...</p>
            ) : null}
          </div>
        ) :

          <main className="flex flex-1 items-start justify-start overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <section className="w-full p-6">
              <h1 className="text-lg font-semibold text-[#242424]">Pohon Keluarga</h1>

              <div className="mt-4 flex flex-col gap-3 min-w-max pr-6">
                {isLoading ? (
                  <p className="text-sm text-[#909090] font-sora">Memuat generasi pertama...</p>
                ) : null}

                {isError ? (
                  <p className="text-sm text-red-500 font-sora">Gagal memuat generasi pertama.</p>
                ) : null}

                {!isLoading && !isError && data?.data.length === 0 ? (
                  <p className="text-sm text-[#909090] font-sora">Tidak ada data generasi pertama.</p>
                ) : null}

                {!isLoading && !isError
                  ? data?.data.map((root, index) => {
                    const people = [root.father, root.mother].filter(
                      (person): person is Person => person !== null,
                    );
                    const rootKey = `${root.father?.id ?? 'no-father'}-${root.mother?.id ?? 'no-mother'}-${index}`;
                    const isOpen = Boolean(openedRoots[rootKey]);

                    return (
                      <div
                        key={rootKey}
                        className="relative"
                      >
                        <div className="flex items-start">
                          <FamilyRootCard
                            people={people}
                            endMarriageDate={root.endMarriageDate}
                            isTappable
                            onTap={() => toggleRootBranch(rootKey)}
                          />

                          {isOpen ? (
                            <div className="relative pl-4 pt-2">
                              {root.father || root.mother ? (
                                <FamilyBranch fatherId={root.father?.id ?? null} motherId={root.mother?.id ?? null} />
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                  : null}
              </div>
            </section>
          </main>
        }
      </div>


      <PersonDetailModal
        person={selectedPerson}
        isOpen={Boolean(selectedPerson)}
        onClose={() => setSelectedPerson(null)}
      />
    </>
  );
}
