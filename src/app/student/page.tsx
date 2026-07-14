import { redirect } from "next/navigation";

/**
 * 학습강의실 now lives at /classroom. Kept as a redirect so any existing
 * bookmarks/links to /student keep working.
 */
export default function StudentPage() {
  redirect("/classroom");
}
