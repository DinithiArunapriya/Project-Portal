import { useMemo } from "react";
import { useAuth } from "./AuthProvider";
import { can as canFn } from "./permissions";

export function usePerms() {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(() => {
    return {
      role,
      can: (cap) => canFn(role, cap),
    };
  }, [role]);
}
