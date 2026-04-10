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
  endMarriageDate: string | null;
}

export interface FamilyRootsResponse {
  success: boolean;
  data: FamilyRoot[];
  count: number;
}

export interface PersonWithSpouse extends Person {
  relationshipType: string;
  spouse: Person | null;
  endMarriageDate: string | null;
}

export interface PersonWithMarriageDates extends Person {
  startMarriageDate: string | null;
  endMarriageDate: string | null;
}

export interface FamilyRootApiItem extends Person {
  spouses: PersonWithMarriageDates[];
}

export interface FamilyRootsApiResponse {
  success: boolean;
  data: FamilyRootApiItem[];
  count: number;
}

export interface FamilyChildApiItem extends Person {
  relationshipType: string;
  spouses: PersonWithMarriageDates[];
}

export interface FamilyChildrenApiResponse {
  success: boolean;
  data: FamilyChildApiItem[];
  count: number;
}



function mapRootItemToFamilyRoots(item: FamilyRootApiItem): FamilyRoot[] {
  if (item.spouses.length === 0) {
    if (item.gender === 'MAN') {
      return [{ father: item, mother: null, isMarried: false, endMarriageDate: null }];
    }

    return [{ father: null, mother: item, isMarried: false, endMarriageDate: null }];
  }

  return item.spouses.map((spouse) => {
    if (item.gender === 'MAN') {
      return {
        father: item,
        mother: spouse,
        isMarried: true,
        endMarriageDate: spouse.endMarriageDate,
      };
    }

    return {
      father: spouse,
      mother: item,
      isMarried: true,
      endMarriageDate: spouse.endMarriageDate,
    };
  });
}

function mapChildItemToPeopleWithSpouse(item: FamilyChildApiItem): PersonWithSpouse[] {
  if (item.spouses.length === 0) {
    return [{ ...item, spouse: null, endMarriageDate: null }];
  }

  return item.spouses.map((spouse) => ({
    ...item,
    spouse,
    endMarriageDate: spouse.endMarriageDate,
  }));
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

export interface PersonListResponse {
  success: boolean;
  data: Person[];
  count: number;
}
