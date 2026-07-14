import { ADMIN_TYPE_LABELS } from "@/features/statistics/constants";
import type { AdminType } from "@/types/database.types";

export function getAdminTypeLabel(adminType: AdminType) {
  return ADMIN_TYPE_LABELS[adminType];
}

export function formatAdminNameWithId(name: string, loginId: string) {
  return `${name} (${loginId})`;
}

export function formatOptionalDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value;
}
