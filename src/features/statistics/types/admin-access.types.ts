import type { AdminType } from "@/types/database.types";

export type AdminAccessQuickPeriod = "" | "1w" | "1m" | "2m" | "3m";

export type AdminAccessListQuery = {
  page: number;
  pageSize: number;
  adminType: AdminType | "";
  quickPeriod: AdminAccessQuickPeriod;
  startDate: string;
  endDate: string;
  adminName: string;
};

export type AdminAccessListItem = {
  id: string;
  adminType: AdminType;
  loginId: string;
  name: string;
  lastAccessAt: string | null;
  accessCount: number;
};

export type AdminAccessLogItem = {
  id: string;
  adminType: AdminType;
  adminName: string;
  adminLoginId: string;
  accessIp: string;
  loggedInAt: string;
  loggedOutAt: string | null;
};

export type GetAdminAccessLogsResult =
  | { success: true; logs: AdminAccessLogItem[] }
  | { success: false; message: string };
