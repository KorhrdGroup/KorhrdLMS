export type CourseBadge = {
  label: string;
  tone: "recommend" | "new" | "urgent";
};

export type CourseInfoData = {
  professor: string;
  format: string;
  method: string;
  duration: string;
  tuitionOriginal: number;
  tuitionFinal: number;
  certFee: number;
};

export type LicenseCardData = {
  number: string;
  agency: string;
  description: string;
  inquiryLabel: string;
  inquiryUrl: string;
};

export type OrganizationInfoData = {
  name: string;
  ceo: string;
  contact: string;
  address: string;
};

export type LecturePlanItem = {
  week: number;
  title: string;
};

export type CourseDescriptionData = {
  heading: string;
  body: string;
  image?: string;
  ministry?: string;
};

export type ActivityItem = {
  id: string;
  order: string;
  title: string;
};

export type ProfessorData = {
  courseLabel: string;
  name: string;
  photo: string;
  intro: string[];
  education: string[];
};

export type RequirementStat =
  | {
      id: string;
      category: string;
      visual: "donut";
      percent: number;
      label: string;
      caption: string;
    }
  | {
      id: string;
      category: string;
      visual: "bar";
      bars: { label: string; percent: number }[];
      caption: string;
    }
  | {
      id: string;
      category: string;
      visual: "flow";
      from: string;
      to: string;
      caption: string;
    };

export type FaqItemData = {
  question: string;
  answer: string;
};

export type StickyEnrollData = {
  title: string;
  professor: string;
  period: string;
  duration: string;
  method: string;
  passCriteria: string;
  originalPrice: number;
  price: number;
  ctaLabel: string;
};

export type CourseDetailData = {
  slug: string;
  title: string;
  ministry: string;
  badges: CourseBadge[];
  originalPrice: number;
  price: number;
  ctaLabel: string;

  info: CourseInfoData;
  license: LicenseCardData;
  organization: OrganizationInfoData;
  lecturePlan: LecturePlanItem[];
  description: CourseDescriptionData;
  goal: string;
  activities: ActivityItem[];
  targets: string[];
  career: { heading: string; bullets: string[] };
  professor: ProfessorData;
  certificateSamples: { label: string; subLabel: string }[];
  certificateNote: string;
  requirements: RequirementStat[];
  requirementNotes: string[];
  faq: FaqItemData[];
  sticky: StickyEnrollData;
};
