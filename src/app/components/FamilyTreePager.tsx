'use client';

import { useState, useRef, useCallback } from 'react';
import { useQueries } from '@tanstack/react-query';
import Image from 'next/image';
import { FamilyRootCard } from './FamilyRootCard';
import { familyTreeService } from '@/services/family-tree.service';
import type { FamilyRoot, ChildPerson, Person, Child } from '@/types/family-tree';
import { Gender } from '@/types/family-tree';

// ─── Constants ────────────────────────────────────────────────────────────────

const PEEK_WIDTH = 40;
const SWIPE_THRESHOLD = 60;

/**
 * Tree connector geometry (px):
 *   TRUNK_X  = trunk line x-offset from the card-list wrapper left edge
 *   LEFT_PAD = padding-left on the card-list wrapper (cards start here)
 *   BRANCH_W = width of each horizontal branch (= LEFT_PAD - TRUNK_X)
 *   GAP_PX   = Tailwind gap-3 between cards
 *   GAP_HALF = used to extend trunk segments into the gap so they touch
 */
const TRUNK_X = 6;
const LEFT_PAD = 14;
const BRANCH_W = LEFT_PAD - TRUNK_X; // 8px
const GAP_PX = 12; // gap-3
const GAP_HALF = GAP_PX / 2; // 6px

const CONNECTOR_COLOR = '#DEDEDE';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function childPersonToFamilyRoot(child: ChildPerson): Child {
  return {
    person: child,
    spouse: child.spouse,
  };
}

function getFamilyPrimaryId(family: FamilyRoot): string | null {
  return family.father?.id ?? family.mother?.id ?? null;
}

function getChildPrimaryId(child: Child): string | null {
  return child.person.id;
}

function getColumnTransform(columnIndex: number, activeIndex: number): string {
  if (columnIndex === activeIndex) {
    return activeIndex > 0 ? `translateX(${PEEK_WIDTH}px)` : 'translateX(0px)';
  }
  if (columnIndex === activeIndex - 1) {
    return `translateX(calc(-100% + ${PEEK_WIDTH}px))`;
  }
  if (columnIndex < activeIndex - 1) return 'translateX(-200%)';
  return 'translateX(100%)';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Card List ────────────────────────────────────────────────────────────────

/**
 * Renders a vertical list of FamilyRootCards.
 *
 * For children panels (columnIndex > 0), injects a tree connector structure:
 *
 *   ────────────┬──── card 1  ← branch extended far-left (clipped → connects to parent)
 *               │
 *               ├──── card 2
 *               │
 *               └──── card 3
 *
 * Each card wrapper owns its trunk SEGMENTS (above + below its center) so the
 * trunk is precisely bounded between the first and last card centers.
 *
 * Coordinate math (all in px, relative to each card wrapper):
 *   - trunk x in card-wrapper coords = TRUNK_X - LEFT_PAD = -BRANCH_W
 *   - branch: from -BRANCH_W to 0 (card left edge)
 *   - trunk segment above: top=-GAP_HALF → bottom=50%  (ends at card center)
 *   - trunk segment below: top=50%       → bottom=-GAP_HALF (starts at card center)
 *   - first card branch: extends far left (width=999, clipped at panel edge)
 */
interface CardListProps {
  families: FamilyRoot[] | null;
  /** Renamed from `children` to avoid collision with React's reserved `children` prop. */
  childItems: Child[] | null;
  columnIndex: number;
  openedId: string | null;
  isActive: boolean;
  align: 'left' | 'right';
  onFamilyTap: (family: FamilyRoot) => void;
}

function CardList({ families, childItems, columnIndex, openedId, isActive, align, onFamilyTap }: CardListProps) {
  const isChildrenPanel = childItems !== null;

  if (!isChildrenPanel) {
    if (families === null) {
      return null;
    }
    return (
      <div className="flex flex-col gap-3">
        {families.map((family) => {
          const primaryId = getFamilyPrimaryId(family);

          const people: Person[] = [];
          if (family.father) {
            people.push(family.father);
          }
          if (family.mother) {
            people.push(family.mother);
          }
          if (people.length === 0) {
            return null;
          }
          return (
            <FamilyRootCard
              key={primaryId}
              people={people}
              align={align}
              isOpened={openedId !== null && openedId === primaryId}
              onTap={isActive ? () => onFamilyTap(family) : undefined}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col gap-3"
      style={{ paddingLeft: LEFT_PAD }}
    >
      {childItems.map((child, index) => {
        const primaryId = getChildPrimaryId(child);
        const isFirst = index === 0;
        const isLast = index === childItems.length - 1;

        const people: Person[] = [child.person];
        if (child.spouse) {
          people.push(child.spouse);
        }
        const father = child.person.gender === Gender.MAN ? child.person : child.spouse;
        const mother = child.person.gender === Gender.WOMAN ? child.person : child.spouse;
        const family: FamilyRoot = {
          father: father,
          mother: mother,
          isMarried: father !== null && mother !== null,
        };

        return (
          <div key={primaryId} className="relative">
            {/* Trunk segment above: connects upward to the previous sibling's center */}
            {!isFirst && (
              <div
                className="absolute"
                style={{
                  left: -BRANCH_W,
                  width: 2,
                  top: -GAP_HALF,
                  bottom: '50%',
                  background: CONNECTOR_COLOR,
                }}
              />
            )}

            {/* Trunk segment below: connects downward to the next sibling's center */}
            {!isLast && (
              <div
                className="absolute"
                style={{
                  left: -BRANCH_W,
                  width: 2,
                  top: '50%',
                  bottom: -GAP_HALF,
                  background: CONNECTOR_COLOR,
                }}
              />
            )}

            {/*
             * Horizontal branch: trunk → card left edge.
             * For the FIRST child the line extends far left (width=999) so it
             * reaches across the peek gap into the parent column — the panel's
             * overflow-x:hidden clips it cleanly at the panel boundary.
             */}
            <div
              className="absolute"
              style={{
                left: isFirst ? -999 : -BRANCH_W,
                width: isFirst ? 999 : BRANCH_W,
                top: '50%',
                transform: 'translateY(-50%)',
                height: 2,
                background: CONNECTOR_COLOR,
              }}
            />

            <FamilyRootCard
              people={people}
              align={align}
              isOpened={openedId !== null && openedId === primaryId}
              onTap={isActive ? () => onFamilyTap(family) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Column Panel ─────────────────────────────────────────────────────────────

interface ColumnPanelProps {
  columnIndex: number;
  totalColumns: number;
  activeIndex: number;
  families: FamilyRoot[] | null;
  /** Renamed from `children` to avoid collision with React's reserved `children` prop. */
  childItems: Child[] | null;
  openedId: string | null;
  isLoading: boolean;
  isError: boolean;
  onFamilyTap: (family: FamilyRoot) => void;
}

function ColumnPanel({
  columnIndex,
  totalColumns,
  activeIndex,
  families,
  childItems,
  openedId,
  isLoading,
  isError,
  onFamilyTap,
}: ColumnPanelProps) {
  const isActive = columnIndex === activeIndex;
  const align = isActive ? 'left' : 'right';
  const transform = getColumnTransform(columnIndex, activeIndex);
  var paddingRight = 0;
  if (totalColumns === 1) {
    paddingRight = 4;
  } else if (isActive) {
    paddingRight = 20;
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-in-out"
      style={{ transform }}
    >
      {isLoading ? (
        <div className="flex flex-col pt-8 gap-3 p-4 pr-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full">
          <Image src="/ic_love.svg" alt="" width={32} height={32} className="opacity-30" />
          <p className="text-sm font-medium text-[#A2A2A2] font-sora">Gagal memuat data</p>
        </div>
      ) : families !== null && families.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-8 text-center h-full">
          <p className="text-sm font-medium text-[#A2A2A2] font-sora">Tidak ada anak</p>
        </div>
      ) : (
        /* pr-5 (20px) gives the right side a bit more breathing room so
           card shadows are not clipped by the panel's overflow-x: hidden. */
        <div className={`pt-8 pb-4 pl-4 pr-${paddingRight}`}>
          <CardList
            families={families}
            childItems={childItems}
            columnIndex={columnIndex}
            openedId={openedId}
            isActive={isActive}
            align={align}
            onFamilyTap={onFamilyTap}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FamilyTreePagerProps {
  rootFamilies: FamilyRoot[];
}

export function FamilyTreePager({ rootFamilies }: FamilyTreePagerProps) {
  const [chain, setChain] = useState<string[]>([]);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  // Pointer refs — works for both mouse drag (desktop) and touch (mobile)
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);

  const queries = useQueries({
    queries: chain.map((personId) => ({
      queryKey: ['family-tree', 'children', personId],
      queryFn: () => familyTreeService.getChildren(personId),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const totalColumns = chain.length + 1;

  const getColumnFamilies = useCallback(
    (columnIndex: number): FamilyRoot[] | null => {
      if (columnIndex !== 0) return null;
      return rootFamilies;
    },
    [rootFamilies],
  );

  const getColumnChildren = useCallback(
    (columnIndex: number): Child[] | null => {
      if (columnIndex === 0) return null;
      const query = queries[columnIndex - 1];
      if (!query?.data?.data) return null;
      return query.data.data.map(childPersonToFamilyRoot);
    },
    [queries],
  );

  const handleFamilyTap = useCallback(
    (family: FamilyRoot, columnIndex: number) => {
      if (columnIndex !== activeColumnIndex) return;

      const personId = getFamilyPrimaryId(family);
      if (!personId) return;

      const currentOpenedId = chain[columnIndex];

      if (currentOpenedId === personId) {
        setChain((prev) => prev.slice(0, columnIndex));
        setActiveColumnIndex(columnIndex);
        return;
      }

      setChain((prev) => [...prev.slice(0, columnIndex), personId]);
      setActiveColumnIndex(columnIndex + 1);
    },
    [activeColumnIndex, chain],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerStartX.current === null) return;
      const dx = e.clientX - pointerStartX.current;
      const dy = Math.abs(e.clientY - (pointerStartY.current ?? 0));
      pointerStartX.current = null;
      pointerStartY.current = null;

      if (dx > SWIPE_THRESHOLD && dy < SWIPE_THRESHOLD && activeColumnIndex > 0) {
        setActiveColumnIndex((prev) => prev - 1);
      }
    },
    [activeColumnIndex],
  );

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'calc(95dvh - 44px)' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {Array.from({ length: totalColumns }, (_, columnIndex) => {
        const columnKey = columnIndex === 0 ? 'root' : chain[columnIndex - 1];
        const isLoading = columnIndex > 0 && !!queries[columnIndex - 1]?.isPending;
        const isError = columnIndex > 0 && !!queries[columnIndex - 1]?.isError;
        const families = getColumnFamilies(columnIndex);
        const childItems = getColumnChildren(columnIndex);
        const openedId = chain[columnIndex] ?? null;

        return (
          <ColumnPanel
            key={columnKey}
            columnIndex={columnIndex}
            totalColumns={totalColumns}
            activeIndex={activeColumnIndex}
            families={families}
            childItems={childItems}
            openedId={openedId}
            isLoading={isLoading}
            isError={isError}
            onFamilyTap={(family) => handleFamilyTap(family, columnIndex)}
          />
        );
      })}
    </div>
  );
}
