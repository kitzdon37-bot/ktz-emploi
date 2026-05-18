export interface CvExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CvEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface CvSkill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface CvLanguage {
  id: string;
  name: string;
  level: string; // Débutant | Intermédiaire | Courant | Bilingue | Natif
}

export interface CvData {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  experiences: CvExperience[];
  education: CvEducation[];
  skills: CvSkill[];
  languages: CvLanguage[];
}

export type CvTemplate = "modern" | "classic" | "creative";

export const EMPTY_CV: CvData = {
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  languages: [],
};

export const LANGUAGE_LEVELS = ["Débutant", "Intermédiaire", "Courant", "Bilingue", "Natif"];
