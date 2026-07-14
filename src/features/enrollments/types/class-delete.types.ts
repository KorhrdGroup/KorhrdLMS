export type ClassDeleteTarget = {
  id: string;
  courseName: string;
  batchName: string;
  year: number | null;
};

export type ClassDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
