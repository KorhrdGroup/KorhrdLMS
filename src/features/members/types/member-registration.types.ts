import type { CalendarType } from "@/types/database.types";

export type MemberRegistrationInput = {
  name: string;
  residentRegistrationNumber: string;
  birthDate: string;
  calendarType: CalendarType;
  loginId: string;
  password: string;
  passwordConfirm: string;
  email: string;
  tel: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  graduatedSchool: string;
  schoolName: string;
  majorName: string;
  desiredDegree: string;
  desiredMajorName: string;
  joinPath: string;
  occupation: string;
  degreePurpose: string;
  referrerLoginId: string;
};

export type MemberRegistrationResult =
  | { success: true; memberId: string }
  | { success: false; message: string; field?: keyof MemberRegistrationInput };

export type LoginIdCheckResult =
  | { available: true; message: string }
  | { available: false; message: string };
