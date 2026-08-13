"use client";

import { X } from "lucide-react";
import * as React from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AdminModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
};

export function AdminModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className,
}: AdminModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-0 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:max-w-md",
          className,
        )}
      >
        <DialogHeader className="shrink-0 gap-1 border-b border-[#E5E7EB] px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold text-[#111827]">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="mt-1 text-sm text-[#6B7280]">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            {showCloseButton ? (
              <AdminButton
                variant="ghost"
                size="icon"
                className="size-9 shrink-0"
                onClick={() => onOpenChange(false)}
                aria-label="닫기"
              >
                <X className="size-5" />
              </AdminButton>
            ) : null}
          </div>
        </DialogHeader>

        {children ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 text-[15px] text-[#111827]">
            {children}
          </div>
        ) : null}

        {footer ? (
          {/* DialogFooter 기본값의 음수 마진(-mx-4 -mb-4)이 p-0 컨텐츠와 만나면
              패딩을 잡아먹습니다 — mx-0 mb-0 으로 되돌립니다 */}
          <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4 sm:justify-end">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
