import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 숫자만 남긴 뒤 010-1234-5678 형태로 자동 하이픈을 삽입합니다. */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function PhoneInput({
  id,
  value,
  onChange,
  placeholder = "휴대폰번호 ('-' 없이 입력)",
  className,
}: PhoneInputProps) {
  return (
    <Input
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      maxLength={13}
      value={value}
      onChange={(event) => onChange(formatPhoneNumber(event.target.value))}
      placeholder={placeholder}
      className={cn(
        "h-12 rounded-md border-[#ddd] bg-[#f8f8f8] px-4 text-base placeholder:text-[#999]",
        className,
      )}
    />
  );
}
