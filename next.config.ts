import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* 잔글씨가 많은 시안 이미지(이력서 배너·자격증 견본)는 기본 품질 75 에서
       글자가 뭉개져 보입니다. 90 을 함께 허용해 그 이미지들만 올려 씁니다.
       Next 16 부터 여기 적은 값만 쓸 수 있습니다(기본 [75]). */
    qualities: [75, 90],
    /* 과정 썸네일은 어드민에서 Supabase Storage 로 올립니다. 원본이 5MB 안팎
       (최대 17MB)이라 그대로 내보내면 목록 한 화면에 수십 MB를 받게 됩니다.
       next/image 가 화면 폭에 맞는 크기로 줄이고 WebP 로 바꿔 내보냅니다.
       호스트는 이 프로젝트 버킷 하나로 좁혀 둡니다. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fikmlxpiehdnsnsvbkbx.supabase.co",
        pathname: "/storage/v1/object/public/course-thumbnails/**",
      },
      /* 교수 사진은 R2 에 올립니다 (과정 상세 '교수 소개') — videokorhrd.com 은
         R2 커스텀 도메인 (r2.dev 는 공개 접근을 꺼서 더 이상 쓰지 않음) */
      {
        protocol: "https",
        hostname: "videokorhrd.com",
        pathname: "/professors/**",
      },
    ],
  },
};

export default nextConfig;
