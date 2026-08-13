'use client';

import { createContext, useContext, useMemo } from 'react';

import { COURSES } from '@/features/korhrd/data/courses';
import type { Course } from '@/features/korhrd/lib/types';

/**
 * 학생 화면에 내보낼 과정만 남긴 카탈로그.
 *
 * 과정 카탈로그(`data/courses.ts`)는 퍼블리싱 원본을 옮긴 **하드코딩 84개**라
 * 어드민에서 비노출(hidden)로 돌려도 목록·검색·메인에서 사라지지 않았습니다.
 * 실제로 자료(영상·교안·시험)가 없는 22개 과정이 수강신청 목록에 떠 있었고,
 * 신청하면 빈 강의실로 들어갔습니다 (2026-08-13 확인).
 *
 * 값은 (korhrd) 레이아웃이 서버에서 조회해 넣습니다
 * — features/korhrd/services/course-visibility.service.ts
 *
 * 코드 목록이 비어 있으면(조회 실패 등) **카탈로그 전체**를 그대로 씁니다.
 * 목록이 통째로 비는 쪽이 몇 개 더 보이는 것보다 나쁩니다.
 */
const VisibleCoursesContext = createContext<string[] | null>(null);

export function VisibleCoursesProvider({
  codes,
  children,
}: {
  codes: string[] | null;
  children: React.ReactNode;
}) {
  return (
    <VisibleCoursesContext.Provider value={codes}>{children}</VisibleCoursesContext.Provider>
  );
}

/** 노출 중인 과정만 남긴 카탈로그. 목록·검색·추천이 모두 이걸 씁니다. */
export function useVisibleCourses(): Course[] {
  const codes = useContext(VisibleCoursesContext);

  return useMemo(() => {
    if (!codes || codes.length === 0) return COURSES;
    const allow = new Set(codes);
    return COURSES.filter((course) => allow.has(course.code));
  }, [codes]);
}
