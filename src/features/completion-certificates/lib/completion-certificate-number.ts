/**
 * 학생 학습강의실 수료증(`src/lib/classroom/certificate-store.ts`)과 동일한
 * 번호 형식(HP-{연도}-{과정코드}-{6자리 난수})을 사용합니다.
 */
export function generateCertificateNumber(courseId: string): string {
  const year = new Date().getFullYear();
  const suffix = courseId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "CRS";
  const random = Math.floor(100000 + Math.random() * 900000);
  return `HP-${year}-${suffix}-${random}`;
}
