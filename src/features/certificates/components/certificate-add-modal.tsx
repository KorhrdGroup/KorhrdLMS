"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { CERTIFICATE_ISSUANCE_COST, CERTIFICATE_PAYMENT_METHOD_OPTIONS } from "@/features/certificate-applications/constants";
import { createCertificateApplicationAction } from "@/features/certificates/actions/certificate.actions";
import type { CreateCertificateApplicationInput } from "@/features/certificates/services/certificate-create.service";
import { M } from "@/features/courses/lib/course-design";

const inputBox: CSSProperties = {
  height: 38,
  width: "100%",
  border: `1px solid ${M.border}`,
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 13,
  color: M.text,
  outline: "none",
  background: "#fff",
};

const labelText: CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 500,
  color: M.body,
  marginBottom: 5,
};

type CertificateAddModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 자격증 검색 후보 — 지금까지 신청된 자격증명 */
  certNames: string[];
  onCreated: (message: string) => void;
};

const emptyForm: CreateCertificateApplicationInput = {
  certificateName: "",
  applicantName: "",
  loginId: "",
  birthDate: "",
  phone: "",
  postalCode: "",
  address: "",
  addressDetail: "",
  amount: String(CERTIFICATE_ISSUANCE_COST),
  paymentMethod: "bank_transfer",
  paymentStatus: "paid",
  memo: "",
};

/**
 * 발급신청 추가 — 회원이 아니어도 넣을 수 있습니다. 자격증은 기존 자격증명에서 검색해
 * 고르거나 새로 적습니다. 아이디는 선택이며, 같은 아이디의 회원이 있으면 연결됩니다.
 */
export function CertificateAddModal({ open, onOpenChange, certNames, onCreated }: CertificateAddModalProps) {
  const [form, setForm] = useState<CreateCertificateApplicationInput>(emptyForm);
  const [certOpen, setCertOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(emptyForm);
      setError(null);
      setCertOpen(false);
    }
    onOpenChange(next);
  }

  function set<K extends keyof CreateCertificateApplicationInput>(
    key: K,
    value: CreateCertificateApplicationInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startSave(async () => {
      const result = await createCertificateApplicationAction(form);
      if (!result.success) {
        setError(result.message);
        return;
      }
      handleOpenChange(false);
      onCreated(result.message);
    });
  }

  const certKeyword = form.certificateName.trim().replace(/\s/g, "").toLowerCase();
  const certMatches = certNames
    .filter((name) => !certKeyword || name.replace(/\s/g, "").toLowerCase().includes(certKeyword))
    .slice(0, 30);

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="발급신청 추가"
      description="결제완료로 넣으면 결제자 칸 맨 위에 올라갑니다. 회원이 아니어도 됩니다."
      className="sm:max-w-xl"
      footer={
        <>
          <AdminButton type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            취소
          </AdminButton>
          <AdminButton type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "저장 중..." : "추가"}
          </AdminButton>
        </>
      }
    >
      {error ? (
        <div style={{ marginBottom: 12, borderRadius: 8, background: "#fdecee", color: M.danger, padding: "9px 12px", fontSize: 13 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ gridColumn: "1 / -1", position: "relative" }}>
          <span style={labelText}>자격증</span>
          <input
            autoFocus
            value={form.certificateName}
            onChange={(event) => {
              set("certificateName", event.target.value);
              setCertOpen(true);
            }}
            onFocus={() => setCertOpen(true)}
            onBlur={() => setTimeout(() => setCertOpen(false), 150)}
            placeholder="자격증명 검색 (예: 심리상담사)"
            style={inputBox}
          />
          {certOpen && certKeyword && certMatches.length > 0 ? (
            <div
              // 스크롤바를 잡아도 입력칸 포커스가 안 빠져 목록이 닫히지 않게 합니다
              onMouseDown={(event) => event.preventDefault()}
              style={{
                position: "absolute",
                zIndex: 10,
                left: 0,
                right: 0,
                top: "100%",
                marginTop: 4,
                maxHeight: 220,
                overflowY: "auto",
                background: "#fff",
                border: `1px solid ${M.border}`,
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              {certMatches.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    set("certificateName", name);
                    setCertOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    fontSize: 13,
                    color: M.text,
                    background: name === form.certificateName ? "#EAF2FE" : "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <label>
          <span style={labelText}>이름</span>
          <input value={form.applicantName} onChange={(event) => set("applicantName", event.target.value)} style={inputBox} />
        </label>
        <label>
          <span style={labelText}>아이디 (선택)</span>
          <input value={form.loginId} onChange={(event) => set("loginId", event.target.value)} placeholder="비회원은 비우면 생년월일 6자리" style={inputBox} />
        </label>
        <label>
          <span style={labelText}>생년월일</span>
          <input type="date" value={form.birthDate} onChange={(event) => set("birthDate", event.target.value)} style={inputBox} />
        </label>
        <label>
          <span style={labelText}>연락처</span>
          <input value={form.phone} onChange={(event) => set("phone", event.target.value)} placeholder="010-0000-0000" style={inputBox} />
        </label>
        <label>
          <span style={labelText}>우편번호</span>
          <input value={form.postalCode} onChange={(event) => set("postalCode", event.target.value)} style={inputBox} />
        </label>
        <label>
          <span style={labelText}>주소</span>
          <input value={form.address} onChange={(event) => set("address", event.target.value)} style={inputBox} />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          <span style={labelText}>상세주소</span>
          <input value={form.addressDetail} onChange={(event) => set("addressDetail", event.target.value)} style={inputBox} />
        </label>

        <label>
          <span style={labelText}>결제상태</span>
          <select
            value={form.paymentStatus}
            onChange={(event) => set("paymentStatus", event.target.value as CreateCertificateApplicationInput["paymentStatus"])}
            style={{ ...inputBox, cursor: "pointer" }}
          >
            <option value="paid">결제완료 (결제자)</option>
            <option value="unpaid">미결제 (미결제자)</option>
          </select>
        </label>
        <label>
          <span style={labelText}>결제방법</span>
          <select value={form.paymentMethod} onChange={(event) => set("paymentMethod", event.target.value)} style={{ ...inputBox, cursor: "pointer" }}>
            <option value="">선택 안 함</option>
            {CERTIFICATE_PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span style={labelText}>실결제금액</span>
          <input inputMode="numeric" value={form.amount} onChange={(event) => set("amount", event.target.value)} style={inputBox} />
        </label>
        <label>
          <span style={labelText}>메모</span>
          <input value={form.memo} onChange={(event) => set("memo", event.target.value)} placeholder="비우면 '관리자 직접 추가'" style={inputBox} />
        </label>
      </div>
    </AdminModal>
  );
}
