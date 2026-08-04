"use client";

import { useState } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { CourseFormField } from "@/features/courses/components/course-form-field";

type CourseStringListFieldProps = {
  label: string;
  idPrefix: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
};

/**
 * 상세페이지의 "이런 분들에게 유용해요"/"진로 및 전망"처럼 순서가 있는 문장 목록을
 * 편집합니다. 항목 추가·삭제·↑↓ 순서변경을 지원하며, 저장 시 빈 항목은 버려집니다.
 */
export function CourseStringListField({
  label,
  idPrefix,
  items,
  onChange,
  placeholder,
  hint,
  error,
  className,
}: CourseStringListFieldProps) {
  const [draft, setDraft] = useState("");

  function updateItem(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) {
      return;
    }
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addDraft() {
    const value = draft.trim();
    if (!value) {
      return;
    }
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <CourseFormField label={label} hint={hint} error={error} className={className}>
      <div className="space-y-2">
        {items.map((item, index) => (
          // 항목은 텍스트가 편집될 수 있어 값 기반 key를 쓸 수 없습니다.
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-6 shrink-0 text-center text-xs font-medium text-[#6B7280]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <AdminInput
              id={`${idPrefix}-${index}`}
              variant="outline"
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
            />
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 px-2"
              onClick={() => moveItem(index, -1)}
              disabled={index === 0}
              aria-label={`${index + 1}번 항목 위로`}
            >
              ↑
            </AdminButton>
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 px-2"
              onClick={() => moveItem(index, 1)}
              disabled={index === items.length - 1}
              aria-label={`${index + 1}번 항목 아래로`}
            >
              ↓
            </AdminButton>
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 px-2 text-[#EF4444]"
              onClick={() => removeItem(index)}
              aria-label={`${index + 1}번 항목 삭제`}
            >
              ✕
            </AdminButton>
          </div>
        ))}

        <div className="flex items-center gap-1.5">
          <span className="w-6 shrink-0" aria-hidden="true" />
          <AdminInput
            id={`${idPrefix}-new`}
            variant="outline"
            value={draft}
            placeholder={placeholder ?? "항목을 입력하고 추가를 누르세요"}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              // 폼 전체 제출을 막고 항목만 추가합니다.
              if (event.key === "Enter") {
                event.preventDefault();
                addDraft();
              }
            }}
          />
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={addDraft}
            disabled={!draft.trim()}
          >
            추가
          </AdminButton>
        </div>
      </div>
    </CourseFormField>
  );
}
