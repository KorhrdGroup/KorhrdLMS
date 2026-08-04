export type ProfessorListItem = {
  id: string;
  name: string;
  /** 이력. 상세페이지 교수 소개에서 한 줄씩 렌더링됩니다. */
  bio: string[];
  photoUrl: string | null;
  /** 이 교수를 담당으로 지정한 과정 수(courses.professor_id 기준). */
  courseCount: number;
  createdAt: string;
};

export type ProfessorFormInput = {
  name: string;
  bio: string[];
  /** 사진 공개 URL. 빈 문자열이면 미등록. */
  photoUrl: string;
};

export type ProfessorMutationResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof ProfessorFormInput };

export type ProfessorDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
