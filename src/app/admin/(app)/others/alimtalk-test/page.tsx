import type { Metadata } from "next";

import { AlimtalkTestView } from "@/features/others/alimtalk-test/components/alimtalk-test-view";
import { M } from "@/features/courses/lib/course-design";
import {
  ALIMTALK_TEMPLATE_LABELS,
  ALIMTALK_TEMPLATES,
  type AlimtalkTemplateKey,
} from "@/lib/aligo/alimtalk";

export const metadata: Metadata = {
  title: "알림톡 테스트 | 운영관리",
};

export default function AlimtalkTestPage() {
  const templates = (Object.keys(ALIMTALK_TEMPLATES) as AlimtalkTemplateKey[]).map((key) => {
    const template = ALIMTALK_TEMPLATES[key];
    return {
      key,
      label: ALIMTALK_TEMPLATE_LABELS[key],
      ready: Boolean(template.tplCode && template.message),
      preview: template.message,
      // 원문의 #{변수} 를 뽑아 입력칸을 만듭니다
      varNames: Array.from(new Set([...template.message.matchAll(/#\{([^}]+)\}/g)].map((m) => m[1]))),
    };
  });

  return (
    <div style={{ background: "#fff", color: M.text, margin: -24, padding: 24, minHeight: "calc(100% + 48px)" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          운영관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>알림톡 테스트</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>알림톡 테스트</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          승인된 템플릿을 골라 내 번호로 실제 발송해 봅니다. 검수 대기 템플릿은 코드 등록 후 활성화됩니다.
        </div>
      </div>

      <AlimtalkTestView templates={templates} />
    </div>
  );
}
