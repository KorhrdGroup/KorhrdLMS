export type ClassListQuery = {
  page: number;
  pageSize: number;
  courseId: string;
  year: string;
};

export type ClassListItem = {
  id: string;
  year: number | null;
  courseName: string;
  batchName: string;
  managerName: string | null;
  applicationPeriodStart: string | null;
  applicationPeriodEnd: string | null;
  enrollmentPeriodStart: string;
  enrollmentPeriodEnd: string;
  createdAt: string;
};

export type ClassFilterOptions = {
  courses: Array<{ id: string; name: string; code: string }>;
  years: number[];
};
