'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Person, FamilyRoot } from '@/types/family-tree';
import { Gender } from '@/types/family-tree';

// ─── Types ────────────────────────────────────────────────────────────────────

type CardVariant = 'married' | 'single-man' | 'single-woman';
type Align = 'left' | 'right';

export interface FamilyRootCardProps {
  root: FamilyRoot;
  align?: Align;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCardVariant(root: FamilyRoot): CardVariant {
  if (root.father && root.mother) return 'married';
  if (root.father) return 'single-man';
  return 'single-woman';
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ member }: { member: Person }) {
  const fallbackPath = member.gender === Gender.MAN ? '/avatar_man.png' : '/avatar_woman.png';
  const [src, setSrc] = useState(member.profilePictureUrl || fallbackPath);

  if (member.profilePictureUrl) {
    return (
      <Image
        src={src}
        alt={member.name}
        width={48}
        height={48}
        className="w-12 h-12 rounded-full object-cover shrink-0"
        onError={() => setSrc(fallbackPath)}
      />
    );
  }

  return (
    <Image
      src={fallbackPath}
      alt={member.name}
      width={48}
      height={48}
      className="w-12 h-12 rounded-full object-cover shrink-0"
    />
  );
}

// ─── Person Row ───────────────────────────────────────────────────────────────

interface PersonRowProps {
  member: Person;
  role?: string;
  align: Align;
}

function PersonRow({ member, role, align }: PersonRowProps) {
  const isLeft = align === 'left';

  return (
    <div className={`flex items-center gap-[7px] ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
      <Avatar member={member} />
      <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
        {role && (
          <span className="text-[12px] font-normal text-[#A2A2A2] font-sora leading-[1.2]">
            {role}
          </span>
        )}
        <span className="text-[16px] font-semibold text-[#242424] font-sora leading-normal">
          {member.name}
        </span>
        {member.birthDate && (
          <div className={`flex items-center gap-1 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
            <Image src="/ic_date.svg" alt="" width={12} height={12} />
            <span className="text-[11px] font-normal text-[#A2A2A2] font-sora">
              {formatDate(member.birthDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────

function CardHeader({ align }: { align: Align }) {
  const isLeft = align === 'left';

  return (
    <div className={`flex items-center ${isLeft ? 'justify-between' : 'justify-end gap-1'}`}>
      {isLeft ? (
        <>
          <div className="flex items-center gap-1">
            <Image src="/ic_love.svg" alt="" width={16} height={16} />
            <span className="text-[12px] font-semibold text-[#909090] font-sora">
              Married Couple
            </span>
          </div>
          <Image src="/ic_forward.svg" alt="lihat detail" width={24} height={24} />
        </>
      ) : (
        <>
          <span className="text-[12px] font-semibold text-[#909090] font-sora">
            Married Couple
          </span>
          <Image src="/ic_love.svg" alt="" width={16} height={16} />
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FamilyRootCard({ root, align = 'left' }: FamilyRootCardProps) {
  const variant = getCardVariant(root);
  const isMarried = variant === 'married';

  return (
    <div className="bg-white rounded-lg p-2 flex flex-col gap-2 shadow-sm">
      {isMarried && <CardHeader align={align} />}

      {root.father && (
        <PersonRow
          member={root.father}
          role={isMarried ? 'Husband' : undefined}
          align={align}
        />
      )}

      {isMarried && root.father && root.mother && (
        <div className="h-px w-full bg-[#EDEDED]" />
      )}

      {root.mother && (
        <PersonRow
          member={root.mother}
          role={isMarried ? 'Wife' : undefined}
          align={align}
        />
      )}
    </div>
  );
}
