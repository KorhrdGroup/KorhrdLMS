"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AdminUser = {
  name: string;
  email: string;
};

type AdminLayoutContextValue = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  adminUser: AdminUser;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  logout: () => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

const SIDEBAR_STORAGE_KEY = "hanpyeong-admin-sidebar-collapsed";

type AdminLayoutProviderProps = {
  children: React.ReactNode;
  adminUser?: AdminUser;
};

export function AdminLayoutProvider({
  children,
  adminUser = { name: "김관리", email: "admin@hanpyeong.kr" },
}: AdminLayoutProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setSidebarCollapsed(stored === "true");
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    // Auth 연동 전 placeholder
    window.location.href = "/admin/login";
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      mobileSidebarOpen,
      adminUser,
      toggleSidebar,
      setMobileSidebarOpen,
      logout,
    }),
    [sidebarCollapsed, mobileSidebarOpen, adminUser, toggleSidebar, logout],
  );

  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  }
  return context;
}
