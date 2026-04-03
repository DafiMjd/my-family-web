import type { FamilyRoot, Person, PersonWithSpouse } from '@/types/family-tree';

interface ParentRoot {
  mother: Person | null;
  father: Person | null;
}

export function toPeopleFromRoot(root: FamilyRoot): Person[] {
  const people: Person[] = [];

  if (root.father) {
    people.push(root.father);
  }
  if (root.mother) {
    people.push(root.mother);
  }

  return people;
}

export function toPeopleFromChild(child: PersonWithSpouse): Person[] {
  const people: Person[] = [child];

  if (child.spouse) {
    people.push(child.spouse);
  }

  return people;
}

export function serializeParentPeople(root: FamilyRoot): string {
  return encodeURIComponent(JSON.stringify({ mother: root.mother, father: root.father } satisfies ParentRoot));
}

export function parseParentPeople(encoded: string | null): ParentRoot {
  if (!encoded) {
    return { mother: null, father: null };
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as Partial<ParentRoot>;
    if (!parsed.mother && !parsed.father) {
      return { mother: null, father: null };
    }
    return { mother: parsed.mother || null, father: parsed.father || null };
  } catch {
    return { mother: null, father: null };
  }
}
