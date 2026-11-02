import Link from 'next/link';
import type { JobGroup } from '@/features/korhrd/lib/types';

/**
 * 직업군 카드. 쓰이는 곳이 둘이고 요소가 다릅니다.
 *  - 메인(캐러셀): 링크 → href 를 넘기세요
 *  - 취업 길찾기(/jobs): 같은 화면에서 목록만 갈아끼우는 탭 → onSelect + active 를 넘기세요
 *
 * 아이콘은 소프트+글래스 3D 그림(public/jobicon/{key}.webp, 투명 배경)입니다.
 * 오피스 콘텐츠 스튜디오 그림체 「소프트+글래스」로 뽑아, 투명 여백을 잘라 정사각형 가운데에 맞췄습니다.
 */
type Props =
  | { group: JobGroup; href: string; onSelect?: never; active?: never }
  | { group: JobGroup; href?: never; onSelect: () => void; active: boolean };

export default function JobGroupCard({ group, href, onSelect, active }: Props) {
  const inner = (
    <>
      <span className="job-group__ico" aria-hidden="true">
        <img src={`/jobicon/${group.key}.webp`} alt="" width={52} height={52} />
      </span>
      <strong>{group.name}</strong>
      <span>{group.desc}</span>
    </>
  );

  if (href) return <Link className="job-group" href={href}>{inner}</Link>;

  return (
    <button className="job-group" type="button" aria-pressed={active} onClick={onSelect}>
      {inner}
    </button>
  );
}
