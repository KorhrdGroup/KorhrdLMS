export type ClassRegistrationInput = {
  courseId: string;
  year: string;
  batchName: string;
  managerName: string;
  applicationStart: string;
  applicationEnd: string;
  enrollmentStart: string;
  enrollmentEnd: string;
};

export type ClassRegistrationResult =
  | { success: true; classId: string; message: string }
  | {
      success: false;
      message: string;
      field?: keyof ClassRegistrationInput;
    };

export type ClassRegistrationCourseOption = {
  id: string;
  name: string;
  code: string;
};

export type ClassRegistrationOptions = {
  courses: ClassRegistrationCourseOption[];
};
