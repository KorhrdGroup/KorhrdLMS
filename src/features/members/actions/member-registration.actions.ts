"use server";

import {
  checkLoginIdAvailability,
  createMember,
} from "@/features/members/services/member-registration.service";
import type {
  LoginIdCheckResult,
  MemberRegistrationInput,
  MemberRegistrationResult,
} from "@/features/members/types/member-registration.types";

export async function checkLoginIdDuplicateAction(
  loginId: string,
): Promise<LoginIdCheckResult> {
  return checkLoginIdAvailability(loginId);
}

export async function createMemberAction(
  input: MemberRegistrationInput,
  loginIdVerified: boolean,
): Promise<MemberRegistrationResult> {
  return createMember(input, loginIdVerified);
}
