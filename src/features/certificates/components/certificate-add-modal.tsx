"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { CERTIFICATE_ISSUANCE_COST, CERTIFICATE_PAYMENT_METHOD_OPTIONS } from "@/features/certificate-applications/constants";
import {
  createCertificateApplicationAction,
  getOfficeStaffAction,
  lookupMemberForCertificateAction,
  searchOfficeStudentsAction,
} from "@/features/certificates/actions/certificate.actions";
import type { OfficeStudent } from "@/features/certificates/services/office-notify";
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

/** 입력칸 밑에 뜨는 고르기 목록 (자격증 · 오피스 학생 · 담당자 공용) */
const dropdownBox: CSSProperties = {
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
};
const dropdownItem = (active: boolean): CSSProperties => ({
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 13,
  color: M.text,
  background: active ? "#EAF2FE" : "#fff",
  border: "none",
  cursor: "pointer",
});

type CertificateAddModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 자격증 검색 후보 — 지금까지 신청된 자격증명 */
  certNames: string[];
  /** warning — 저장은 됐지만 담당자 오피스 알림을 못 보냈을 때 */
  onCreated: (message: string, warning?: string) => void;
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
  managerName: "",
};

/**
 * 발급신청 추가 — 회원이 아니어도 넣을 수 있습니다. 자격증은 기존 자격증명에서 검색해
 * 고르거나 새로 적습니다. 아이디는 선택이며, 같은 아이디의 회원이 있으면 연결됩니다.
 */
export function CertificateAddModal({ open, onOpenChange, certNames, onCreated }: CertificateAddModalProps) {
  const [form, setForm] = useState<CreateCertificateApplicationInput>(emptyForm);
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  const [certOpen, setCertOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  // 담당자 고르기 — 오피스 재직 직원 이름. 창을 처음 열 때 한 번 받습니다 (2026-11-23)
  const [staff, setStaff] = useState<string[]>([]);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffDone, setStaffDone] = useState(false);
  const staffAsked = useRef(false);
  const staffLoading = open && !staffDone;
  // 아이디 → 회원 정보 자동 채우기 (2026-11-23 사용자). 빈 칸만 채운다 — 이미 적은 칸은 그대로
  const [memberNote, setMemberNote] = useState<{ text: string; tone: "ok" | "warn" } | null>(null);
  const [memberLooking, setMemberLooking] = useState(false);
  const lookedId = useRef("");
  // 이름 · 전화번호 → 오피스 「민간자격증」 탭 학생 후보 (2026-11-23 사용자 「이름 전화번호 입력하면 뜨게」)
  const [studentHits, setStudentHits] = useState<OfficeStudent[]>([]);
  const [studentField, setStudentField] = useState<"name" | "phone" | null>(null);
  const searchSeq = useRef(0);
  // 담당자 — 검색해서 고르기 (2026-11-23 사용자 「담당자를 검색해서 찾을 수 있게」)
  const [staffQuery, setStaffQuery] = useState("");
  const [staffOpen, setStaffOpen] = useState(false);
  const staffMatches = staff.filter((name) => !staffQuery.trim() || name.includes(staffQuery.trim()));
  const [staffHint, setStaffHint] = useState<string | null>(null);
  // 친 글자 — 칸을 벗어난 0.15초 뒤 확정할 때 창이 이미 닫혔거나 저장에서 썼으면 비어 있게 (늦은 확정이 다음 창에 담당자를 넣지 않게)
  const staffTypedRef = useRef("");

  /** 담당자 칸에 친 글자 — 목록을 안 눌러도 이름이 똑같거나 맞는 사람이 하나면 그 사람으로 (Opus 5.5 리뷰) */
  function commitStaffQuery() {
    const q = staffTypedRef.current.trim();
    staffTypedRef.current = "";
    if (!q) return;
    const exact = staff.find((name) => name === q);
    const only = staffMatches.length === 1 ? staffMatches[0] : undefined;
    const chosen = exact ?? only;
    if (chosen) {
      set("managerName", chosen);
      setStaffHint(null);
    } else {
      setStaffHint(`「${q}」 — 목록에서 담당자를 골라 주세요.`);
    }
    setStaffQuery("");
  }

  const [studentError, setStudentError] = useState<string | null>(null);

  function searchStudents(field: "name" | "phone", value: string) {
    const seq = ++searchSeq.current;
    setStudentField(field);
    setStudentHits([]); // 다른 칸으로 옮겨 칠 때 앞 칸 후보가 남지 않게 (Opus 5.5 리뷰)
    setStudentError(null);
    const keyword = value.trim();
    const enough = field === "name" ? keyword.length >= 2 : keyword.replace(/\D/g, "").length >= 4;
    if (!enough) {
      setStudentHits([]);
      return;
    }
    // 글자를 칠 때마다 묻지 않게 0.3초 기다렸다가, 그 사이 또 쳤으면 버린다
    window.setTimeout(async () => {
      if (seq !== searchSeq.current) return;
      let result: Awaited<ReturnType<typeof searchOfficeStudentsAction>>;
      try {
        result = await searchOfficeStudentsAction(keyword);
      } catch {
        result = { students: [], error: "오피스 학생을 불러오지 못했습니다." };
      }
      if (seq !== searchSeq.current) return;
      if (result.error) setStudentError(result.error);
      // 이름과 번호가 둘 다 똑같은 학생이 딱 한 명이면 고르지 않아도 바로 채운다 (2026-11-23 사용자 「이름이랑 번호랑 동일해야 해」)
      const typedName = formRef.current.applicantName.trim();
      const typedDigits = formRef.current.phone.replace(/\D/g, "");
      const exact =
        typedName && typedDigits.length >= 10
          ? result.students.filter((st) => st.name === typedName && st.phone.replace(/\D/g, "") === typedDigits)
          : [];
      // 같은 사람이 여러 줄(신청 여러 번)이어도 한 명으로 — 결과가 최근 순이라 첫 줄을 쓴다 (Opus 5.5 리뷰)
      if (exact.length >= 1) {
        pickStudent(exact[0]);
        return;
      }
      setStudentHits(result.students);
    }, 300);
  }

  function closeStudentHits() {
    searchSeq.current++;
    setStudentHits([]);
    setStudentField(null);
  }

  function pickStudent(student: OfficeStudent) {
    const course = student.course.trim();
    const prev = formRef.current;
    // 비었거나 앞서 자동으로 채운 값 그대로면 바꿔도 되는 칸 (아이디 조회 · 학생 고르기 모두 lastAuto 에 남긴다)
    const free = (key: keyof CreateCertificateApplicationInput) => !prev[key].trim() || prev[key] === lastAuto.current[key];
    const manager = student.manager && staff.includes(student.manager) && !prev.managerName ? student.manager : "";
    const fillAddress = free("postalCode") && free("address") && free("addressDetail") && !!student.address;
    const fillBirth = free("birthDate") && !!student.birthDate;
    const patch: Partial<CreateCertificateApplicationInput> = {
      applicantName: student.name || prev.applicantName,
      phone: student.phone || prev.phone,
      ...(fillBirth ? { birthDate: student.birthDate } : {}),
      ...(fillAddress ? { postalCode: "", address: student.address, addressDetail: student.addressDetail } : {}),
      ...(!prev.certificateName.trim() && course ? { certificateName: course } : {}),
      ...(manager ? { managerName: manager } : {}),
    };
    lastAuto.current = { ...lastAuto.current, ...patch };
    setForm((current) => ({ ...current, ...patch }));
    closeStudentHits();
    const filled = ["이름", "연락처", fillBirth && "생년월일", fillAddress && "주소", patch.certificateName && "자격증", manager && `담당자(${manager})`].filter(Boolean);
    // 아이디 칸이 차 있으면 그 회원과 다른 사람일 수 있다 (Opus 5.5 리뷰 — 두 사람 정보가 섞여 저장되지 않게)
    setMemberNote(
      prev.loginId.trim()
        ? { text: `오피스 학생으로 ${filled.join(" · ")}를 채웠습니다. 아이디 「${prev.loginId.trim()}」 회원과 같은 사람인지 확인해 주세요.`, tone: "warn" }
        : { text: `오피스 민간자격증 학생으로 ${filled.join(" · ")}를 채웠습니다.`, tone: "ok" },
    );
  }


  // 조회 회차 — 창을 닫거나 아이디를 바꾸면 늦게 온 결과는 버린다 (Opus 5.5 리뷰: 닫힌 창에 앞 사람 정보가 남던 문제)
  const memberSeq = useRef(0);
  // 직전에 자동으로 채운 값 — 그 값 그대로인 칸은 다른 회원을 조회하면 새 값으로 바꾼다 (A → B 로 아이디를 고친 경우)
  const lastAuto = useRef<Partial<CreateCertificateApplicationInput>>({});

  async function fillFromMember() {
    const loginId = form.loginId.trim();
    if (!loginId || loginId === lookedId.current) return;
    lookedId.current = loginId;
    const seq = ++memberSeq.current;
    setMemberLooking(true);
    try {
      const result = await lookupMemberForCertificateAction(loginId);
      if (seq !== memberSeq.current || formRef.current.loginId.trim() !== loginId) return;
      if (!result.found) {
        setMemberNote(result.message ? { text: result.message, tone: "warn" } : null);
        return;
      }
      const m = result.member;
      const prev = formRef.current;
      // 비었거나 직전 자동 채움 값 그대로면 채워도 되는 칸
      const free = (key: keyof CreateCertificateApplicationInput) => !prev[key].trim() || prev[key] === lastAuto.current[key];
      const patch: Partial<CreateCertificateApplicationInput> = {};
      const filled: string[] = [];
      const put = (key: "applicantName" | "birthDate" | "phone", value: string, label: string) => {
        if (free(key) && value && prev[key] !== value) {
          patch[key] = value;
          filled.push(label);
        }
      };
      put("applicantName", m.name, "이름");
      put("birthDate", m.birthDate, "생년월일");
      put("phone", m.phone, "연락처");
      // 주소는 세 칸 모두 채워도 될 때만 한 묶음으로
      if (free("postalCode") && free("address") && free("addressDetail") && (m.address || m.postalCode)) {
        patch.postalCode = m.postalCode;
        patch.address = m.address;
        patch.addressDetail = m.addressDetail;
        filled.push("주소");
      }
      lastAuto.current = { ...lastAuto.current, ...patch };
      setForm((current) => ({ ...current, ...patch }));
      setMemberNote({
        text: filled.length ? `회원 정보로 ${filled.join(" · ")}을(를) 채웠습니다.` : "회원입니다 — 채울 빈 칸이 없습니다.",
        tone: "ok",
      });
    } catch {
      if (seq !== memberSeq.current) return;
      lookedId.current = ""; // 실패하면 같은 아이디로 다시 조회할 수 있게
      setMemberNote({ text: "회원 정보를 읽지 못했습니다.", tone: "warn" });
    } finally {
      if (seq === memberSeq.current) setMemberLooking(false);
    }
  }

  useEffect(() => {
    if (!open || staffAsked.current) return;
    staffAsked.current = true;
    getOfficeStaffAction()
      .then((result) => {
        setStaff(result.staff);
        setStaffError(result.error);
        // 못 받았으면 다음에 창을 열 때 다시 묻는다 (Opus 5.5 리뷰)
        if (result.error) staffAsked.current = false;
      })
      .catch(() => {
        setStaffError("오피스 직원 목록을 받지 못했습니다.");
        staffAsked.current = false;
      })
      .finally(() => setStaffDone(true));
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(emptyForm);
      setError(null);
      setCertOpen(false);
      setMemberNote(null);
      lookedId.current = "";
      memberSeq.current++;
      setMemberLooking(false);
      lastAuto.current = {};
      closeStudentHits();
      setStudentError(null);
      setStaffOpen(false);
      setStaffQuery("");
      setStaffHint(null);
      staffTypedRef.current = "";
      // 담당자 목록을 못 받았으면 다음에 열 때 「불러오는 중」부터 다시 보이게 (Opus 5.5 리뷰)
      if (staffError) {
        setStaffError(null);
        setStaffDone(false);
      }
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
    // 담당자 칸에 친 글자가 남아 있으면 지금 확정한다 — 칸을 벗어나며 확정하는 0.15초를 기다리지 않고 바로 「추가」를 눌러도 (Opus 5.5 리뷰)
    let formToSave = form;
    const typed = staffTypedRef.current.trim();
    staffTypedRef.current = "";
    if (typed) {
      const chosen = staff.find((name) => name === typed) ?? (staffMatches.length === 1 ? staffMatches[0] : undefined);
      if (!chosen) {
        setStaffHint(`「${typed}」 — 목록에서 담당자를 골라 주세요.`);
        setError("담당자를 목록에서 골라 주세요.");
        return;
      }
      formToSave = { ...form, managerName: chosen };
      setForm(formToSave);
      setStaffQuery("");
      setStaffOpen(false);
    }
    startSave(async () => {
      const result = await createCertificateApplicationAction(formToSave);
      if (!result.success) {
        setError(result.message);
        return;
      }
      handleOpenChange(false);
      onCreated(result.message, result.notifyError);
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

        <div style={{ position: "relative" }}>
          <span style={labelText}>이름</span>
          <input
            value={form.applicantName}
            onChange={(event) => {
              set("applicantName", event.target.value);
              searchStudents("name", event.target.value);
            }}
            onBlur={() => setTimeout(() => setStudentField((f) => (f === "name" ? null : f)), 150)}
            placeholder="두 글자 넣으면 오피스 민간자격증 학생이 떠요"
            style={inputBox}
          />
          {studentField === "name" && studentHits.length > 0 ? (
            <StudentHits hits={studentHits} onPick={pickStudent} />
          ) : null}
          {studentField === "name" && studentError ? (
            <span style={{ display: "block", marginTop: 5, fontSize: 12, color: M.danger }}>{studentError}</span>
          ) : null}
        </div>
        <div style={{ position: "relative" }}>
          <span style={labelText}>연락처</span>
          <input
            value={form.phone}
            onChange={(event) => {
              set("phone", event.target.value);
              searchStudents("phone", event.target.value);
            }}
            onBlur={() => setTimeout(() => setStudentField((f) => (f === "phone" ? null : f)), 150)}
            placeholder="010-0000-0000 (숫자 4개면 학생이 떠요)"
            style={inputBox}
          />
          {studentField === "phone" && studentHits.length > 0 ? (
            <StudentHits hits={studentHits} onPick={pickStudent} />
          ) : null}
          {studentField === "phone" && studentError ? (
            <span style={{ display: "block", marginTop: 5, fontSize: 12, color: M.danger }}>{studentError}</span>
          ) : null}
        </div>
        <label>
          <span style={labelText}>생년월일</span>
          <input type="date" value={form.birthDate} onChange={(event) => set("birthDate", event.target.value)} style={inputBox} />
        </label>
        <label>
          <span style={labelText}>아이디 (선택)</span>
          <input
            value={form.loginId}
            onChange={(event) => {
              set("loginId", event.target.value);
              setMemberNote(null);
              lookedId.current = ""; // 고쳤다가 되돌려도 다시 조회
            }}
            onBlur={() => void fillFromMember()}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void fillFromMember();
              }
            }}
            placeholder="회원이면 넣고 다른 칸으로 — 정보가 채워집니다"
            style={inputBox}
          />
          {memberLooking || memberNote ? (
            <span style={{ display: "block", marginTop: 5, fontSize: 12, color: memberNote?.tone === "warn" ? M.danger : M.body }}>
              {memberLooking ? "회원 정보 찾는 중..." : memberNote?.text}
            </span>
          ) : null}
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
        <div style={{ gridColumn: "1 / -1", position: "relative" }}>
          <span style={labelText}>담당자 (오피스 알림)</span>
          <input
            value={staffOpen ? staffQuery : form.managerName}
            onChange={(event) => {
              setStaffQuery(event.target.value);
              staffTypedRef.current = event.target.value;
              setStaffOpen(true);
            }}
            onFocus={() => {
              setStaffQuery("");
              setStaffOpen(true);
            }}
            onBlur={() =>
              setTimeout(() => {
                commitStaffQuery();
                setStaffOpen(false);
              }, 150)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                commitStaffQuery();
                setStaffOpen(false);
              }
            }}
            disabled={staffLoading || staff.length === 0}
            placeholder={staffLoading ? "직원 목록 불러오는 중..." : "이름으로 찾기 — 비우면 알리지 않음"}
            style={inputBox}
          />
          {staffOpen && staff.length > 0 ? (
            <div onMouseDown={(event) => event.preventDefault()} style={dropdownBox}>
              <button
                type="button"
                onClick={() => {
                  set("managerName", "");
                  setStaffOpen(false);
                }}
                style={{ ...dropdownItem(!form.managerName), color: M.body }}
              >
                알리지 않음
              </button>
              {staffMatches.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    set("managerName", name);
                    staffTypedRef.current = "";
                    setStaffQuery("");
                    setStaffHint(null);
                    setStaffOpen(false);
                  }}
                  style={dropdownItem(name === form.managerName)}
                >
                  {name}
                </button>
              ))}
              {staffMatches.length === 0 ? (
                <div style={{ padding: "8px 12px", fontSize: 13, color: M.body }}>맞는 직원이 없습니다</div>
              ) : null}
            </div>
          ) : null}
          <span style={{ display: "block", marginTop: 5, fontSize: 12, color: staffError || staffHint ? M.danger : M.body }}>
            {staffError ?? staffHint ?? "고르면 추가한 뒤 그 직원의 오피스에 「발급신청이 추가되었습니다」 알림 팝업이 뜹니다."}
          </span>
        </div>
      </div>
    </AdminModal>
  );
}

/** 오피스 민간자격증 학생 후보 — 이름 · 연락처 · 희망과정 · 담당자 */
function StudentHits({ hits, onPick }: { hits: OfficeStudent[]; onPick: (student: OfficeStudent) => void }) {
  return (
    <div onMouseDown={(event) => event.preventDefault()} style={dropdownBox}>
      <div style={{ padding: "6px 12px", fontSize: 11.5, color: M.body, borderBottom: `1px solid ${M.border}` }}>
        오피스 민간자격증 학생 — 고르면 채워집니다
      </div>
      {hits.map((student) => (
        <button key={student.id} type="button" onClick={() => onPick(student)} style={dropdownItem(false)}>
          <span style={{ fontWeight: 600 }}>{student.name}</span>
          <span style={{ color: M.body }}>
            {" · "}
            {student.phone || "번호 없음"}
            {student.courses.length ? ` · ${student.courses.slice(0, 2).join(", ")}${student.courses.length > 2 ? " 외" : ""}` : ""}
            {student.manager ? ` · 담당 ${student.manager}` : ""}
          </span>
        </button>
      ))}
    </div>
  );
}
