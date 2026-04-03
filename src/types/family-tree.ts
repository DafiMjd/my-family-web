export const Gender = {
  MAN: 'MAN',
  WOMAN: 'WOMAN',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  deathDate: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyRoot {
  father: Person | null;
  mother: Person | null;
  isMarried: boolean;
}

export interface FamilyRootsResponse {
  success: boolean;
  data: FamilyRoot[];
  count: number;
}

export interface PersonWithSpouse extends Person {
  relationshipType: string;
  spouse: Person | null;
}

export interface FamilyChildrenResponse {
  success: boolean;
  data: PersonWithSpouse[];
  count: number;
}

export interface ClosestRelatedPeople {
  spouse: Person | null;
  children: Person[];
  parents: Person[];
}

export interface ClosestRelatedPeopleResponse {
  success: boolean;
  data: ClosestRelatedPeople;
}
