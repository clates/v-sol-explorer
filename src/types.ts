export interface Substandard {
  id: string;
  description: string;
}

export interface Standard {
  id: string;
  description: string;
  substandards?: Substandard[];
}

export interface Category {
  id: string;
  title: string;
  standards: Standard[];
}

export interface SubjectStandard {
  id: string;
  title: string;
  subject: string;
  grade: string;
  last_updated: string;
  source_url: string;
  categories: Category[];
}
