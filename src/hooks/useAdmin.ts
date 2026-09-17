"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

// Hook personalizado para gerenciar e verificar o status de administrador
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Executa checagem de sessão no backend sem cache
  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/check", {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      const data = await res.json();
      setIsAdmin(Boolean(data.isAdmin));
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Encerra a sessão do administrador
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAdmin(false);
    window.location.href = "/";
  };

  useEffect(() => {
    check();
  }, [check, pathname]);

  return { isAdmin, loading, logout, check };
}