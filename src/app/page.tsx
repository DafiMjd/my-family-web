'use client';

import { useFamilyRoots } from '@/hooks/use-family-roots';
import { FamilyRootCard } from '@/app/components/FamilyRootCard';

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
  const { data, isLoading, isError, error, refetch, isFetching } = useFamilyRoots();

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
    <div className="flex flex-col pt-8 gap-3 p-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : data?.data.map((root) => (
            <FamilyRootCard
              key={root.father?.id ?? root.mother?.id}
              root={root}
            />
          ))}
    </div>
  );
}
