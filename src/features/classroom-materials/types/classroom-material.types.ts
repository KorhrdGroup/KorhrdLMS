/**
 * 학생 학습강의실 '학습자료실'(`/classroom/[slug]/materials`) 타입 정의입니다.
 *
 * 관리자 자료실(`src/features/learning-materials`)에서 등록/공개한
 * `learning_materials` 데이터를 학생 화면에 맞춰 매핑합니다.
 */
export type ClassroomMaterialItem = {
  id: string;
  /** 게시판 번호(최신 글이 가장 큰 번호). */
  seq: number;
  title: string;
  content: string;
  fileName: string;
  fileUrl: string | null;
  /** 특정 과정 전용 자료가 아닌 전체 공통 자료인지 여부. */
  isCommon: boolean;
  createdBy: string;
  createdAt: string;
};

export type ClassroomMaterialList = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  materials: ClassroomMaterialItem[];
};

export type ClassroomMaterialDetailResult =
  | { success: true; courseTitle: string; material: ClassroomMaterialItem | null }
  | { success: false };
