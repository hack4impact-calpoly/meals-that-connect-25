"use client";

import { useState, createContext, useContext, useEffect, Dispatch, SetStateAction } from "react";

type UserRoleContextType = {
  userRole: string | null;
  setUserRole: Dispatch<SetStateAction<string | null>>;
};

const UserRoleContext = createContext<UserRoleContextType | null>(null);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchCurrentUser = async () => {
  //     try {
  //       const res = await fetch("/api/users/me");
  //       if (res.ok) {
  //         const data = await res.json();
  //         setUserRole(data.role);
  //       }
  //     } catch (error) {
  //       setUserRole(null);
  //     }
  //   };

  //   fetchCurrentUser();
  // }, []);

  return <UserRoleContext.Provider value={{ userRole, setUserRole }}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
