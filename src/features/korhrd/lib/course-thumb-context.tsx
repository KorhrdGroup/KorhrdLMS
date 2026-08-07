'use client';

import { createContext, useContext } from 'react';

import type { Course } from '@/features/korhrd/lib/types';

/**
 * 어드민 과정관리에서 올린 최신 썸네일(courses.thumbnail_url)을 클라이언트 카드에 내려줍니다.
 * 값은 (korhrd) 레이아웃이 서버에서 조회해 넣습니다 — features/korhrd/lib/course-thumbnails.ts
 *
 * 맵이 비어 있으면(조회 실패·미로그인 등) 카드는 스냅샷 데이터의 `thumb`를 그대로 씁니다.
 */
const CourseThumbContext = createContext<Record<string, string>>({});

export function CourseThumbProvider({
  value,
  children,
}: {
  value: Record<string, string>;
  children: React.ReactNode;
}) {
  return <CourseThumbContext.Provider value={value}>{children}</CourseThumbContext.Provider>;
}

/** 과정 카드에서 쓸 썸네일 URL. DB 값이 있으면 그것을, 없으면 스냅샷 값을 돌려줍니다. */
export function useCourseThumb(course: Pick<Course, 'code' | 'n' | 'thumb'>) {
  const map = useContext(CourseThumbContext);
  const byCode = course.code ? map[course.code] : undefined;
  const byName = map[`name:${course.n.replace(/\s+/g, '').replace(/\d급$/, '')}`];
  return byCode ?? byName ?? course.thumb;
}
