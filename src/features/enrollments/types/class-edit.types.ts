import type { ClassRegistrationInput } from "@/features/enrollments/types/class-registration.types";

export type ClassEditInput = ClassRegistrationInput;

export type ClassEditResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      field?: keyof ClassEditInput;
    };
