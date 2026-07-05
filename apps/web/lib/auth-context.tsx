"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken } from "./api";

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface FamilyMember {
  id: string;
  fullName: string;
  familyId: string;
  userId?: string | null;
  role: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  allergies?: string[];
  isDependent?: boolean;
  avatarUrl?: string | null;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
}

interface AuthContextType {
  user: User | null;
  families: Family[];
  familyMembers: FamilyMember[];
  selectedMemberId: string | null;
  selectedMember: FamilyMember | null;
  selectedFamilyId: string | null;
  setSelectedMemberId: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function setAuthCookie(token: string) {
  document.cookie = `mg-auth-token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = "mg-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedMemberId, setSelectedMemberIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const safeFamilies = Array.isArray(families) ? families.filter(Boolean) : [];
  const familyMembers = safeFamilies.flatMap((f) => f?.members || []);

  const selectedMember = familyMembers.find((m) => m?.id === selectedMemberId) || null;
  const selectedFamilyId = selectedMember?.familyId || (safeFamilies[0]?.id ?? null);

  const setSelectedMemberId = useCallback((id: string) => {
    setSelectedMemberIdState(id);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("mg-selected-member", id);
    }
  }, []);

  // Hydrate auth state on mount
  useEffect(() => {
    const hydrate = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get<{
          user: User;
          families: Family[];
        }>("/auth/me");

        setUser(data.user);
        setFamilies(data.families);

        // Restore selected member from localStorage or default to first
        const stored = typeof localStorage !== "undefined" ? localStorage.getItem("mg-selected-member") : null;
        const allMembers = (data.families || []).filter(Boolean).flatMap((f) => f?.members || []);
        if (stored && allMembers.find((m) => m.id === stored)) {
          setSelectedMemberIdState(stored);
        } else if (allMembers.length > 0) {
          setSelectedMemberIdState(allMembers[0].id);
        }
      } catch {
        // Not authenticated or token expired — that's fine
        clearAuthCookie();
        setUser(null);
        setFamilies([]);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{
      token: string;
      user: User;
    }>("/auth/login", { email, password });

    setAuthCookie(data.token);
    setUser(data.user);

    // Fetch full profile with families
    const profile = await api.get<{ user: User; families: Family[] }>("/auth/me");
    setFamilies(profile.families);

    const allMembers = (profile.families || []).filter(Boolean).flatMap((f) => f?.members || []);
    if (allMembers.length > 0) {
      setSelectedMemberIdState(allMembers[0].id);
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const data = await api.post<{
      token: string;
      user: User;
      family: Family;
    }>("/auth/register", { fullName, email, password });

    setAuthCookie(data.token);
    setUser(data.user);
    setFamilies([data.family]);

    if (data.family?.members?.length > 0) {
      setSelectedMemberIdState(data.family.members[0].id);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthCookie();
    setUser(null);
    setFamilies([]);
    setSelectedMemberIdState(null);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("mg-selected-member");
    }
    // Redirect to login
    window.location.href = "/auth/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        families,
        familyMembers,
        selectedMemberId,
        selectedMember,
        selectedFamilyId,
        setSelectedMemberId,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
