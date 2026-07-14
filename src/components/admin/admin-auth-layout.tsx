type AdminAuthLayoutProps = {
  children: React.ReactNode;
};

export function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#F5F5F5] px-4">
      {children}
    </div>
  );
}
