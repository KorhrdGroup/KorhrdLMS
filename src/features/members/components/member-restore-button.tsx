import { RotateCcw } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";

type MemberRestoreButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function MemberRestoreButton({
  onClick,
  disabled = true,
  size = "sm",
  className,
}: MemberRestoreButtonProps) {
  return (
    <AdminButton
      type="button"
      variant="outline"
      size={size}
      disabled={disabled}
      onClick={onClick}
      title={disabled ? "다음 단계에서 구현 예정" : undefined}
      className={className}
    >
      <RotateCcw className="size-4" />
      복구
    </AdminButton>
  );
}
