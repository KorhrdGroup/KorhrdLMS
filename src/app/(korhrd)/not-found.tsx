import NotFoundContent from '@/features/korhrd/components/NotFoundContent';

/**
 * 학생 화면 안에서 notFound()를 던졌을 때(없는 과정·후기·공지 등)의 404입니다.
 * 껍데기는 (korhrd)/layout.tsx가 씌워주므로 본문만 둡니다.
 */
export default function NotFound() {
  return <NotFoundContent />;
}
