'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { FamilyRootCard } from '@/app/components/FamilyRootCard';
import { PersonDetailModal } from '@/app/components/PersonDetailModal';
import { useFamilyChildren } from '@/hooks/use-family-children';
import { parseParentPeople, serializeParentPeople, toPeopleFromChild } from '@/lib/family-navigation';
import { Avatar } from '@/app/components/Avatar';
import { Gender, type FamilyRoot, type Person as FamilyPerson } from '@/types/family-tree';

function PersonCard({ person, className }: { person: FamilyPerson, className?: string }) {
  return (
    <div className={`flex items-center justify-center flex-col gap-2 ${className}`}>
      <Avatar member={person} size={24} />
      <div className="flex flex-col gap-2">
        <h1 className="text-[16px] font-semibold text-[#242424] font-sora">{person.name}</h1>
      </div>
    </div>
  );
}

function Parent({ mother, father }: { mother: FamilyPerson; father: FamilyPerson }) {
  return (
    <div className="flex items-center justify-center flex-row gap-10">
      <PersonCard person={father} className="w-1/2" />
      <Image src="/ic_love.svg" alt="" width={24} height={24} className={`w-8 h-8`} />
      <PersonCard person={mother} className="w-1/2" />
    </div>
  );
}

export default function FamilyDetailPage() {
  const router = useRouter();
  const [selectedPerson, setSelectedPerson] = useState<FamilyPerson | null>(null);
  const params = useParams<{ personId: string }>();
  const searchParams = useSearchParams();

  const personId = params.personId;
  const parentPeople = useMemo(() => parseParentPeople(searchParams.get('parent')), [searchParams]);
  const { data, isLoading, isError, error, refetch, isFetching } = useFamilyChildren(personId);
  const father = parentPeople.father;
  const mother = parentPeople.mother;

  if (!father || !mother) {
    return <div>Orang tua tidak ditemukan</div>;
  }

  return (
    <>
      <div className="flex flex-col pt-8 gap-4 p-4">
        <section className="flex flex-col gap-4">
          <h1 className="text-[14px] font-regular text-[#242424] font-sora">Detail Keluarga</h1>
          <Parent mother={mother} father={father} />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[14px] font-regular text-[#242424] font-sora">Anak</h2>

          {isLoading ? (
            <p className="text-sm text-[#909090] font-sora">Memuat data anak...</p>
          ) : null}

          {isError ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-red-500">Gagal memuat data anak</p>
              <p className="text-xs text-gray-400">{error.message}</p>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-fit px-4 py-2 rounded-lg bg-[#242424] text-white text-sm font-sora font-semibold disabled:opacity-50 active:scale-95 transition-transform"
              >
                {isFetching ? 'Memuat...' : 'Coba Lagi'}
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && data?.data.length === 0 ? (
            <p className="text-sm text-[#909090] font-sora">Data anak tidak ditemukan.</p>
          ) : null}

          {!isLoading && !isError
            ? data?.data.map((child) => {
                const people = toPeopleFromChild(child);
                return (
                  <FamilyRootCard
                    key={child.id}
                    people={people}
                    isTappable={people.length > 0}
                    onTap={(person, tappedPeople) => {
                      if (!child.spouse) {
                        setSelectedPerson(person);
                        return;
                      }

                      const nextFather = tappedPeople.find((member) => member.gender === Gender.MAN) ?? null;
                      const nextMother = tappedPeople.find((member) => member.gender === Gender.WOMAN) ?? null;
                      const payload = serializeParentPeople({
                        father: nextFather,
                        mother: nextMother,
                        isMarried: Boolean(nextFather && nextMother),
                      } satisfies FamilyRoot);
                      router.push(`/family/${person.id}?parent=${payload}`);
                    }}
                  />
                );
              })
            : null}
        </section>
      </div>

      <PersonDetailModal
        person={selectedPerson}
        isOpen={Boolean(selectedPerson)}
        onClose={() => setSelectedPerson(null)}
      />
    </>
  );
}
