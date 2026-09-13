"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: "admin" | "moderator" | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAdmin: false,
  adminRole: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<"admin" | "moderator" | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data as Profile | null);
  }, []);

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", userId)
        .single();
      if (data) {
        setIsAdmin(true);
        setAdminRole(data.role as "admin" | "moderator");
      } else {
        setIsAdmin(false);
        setAdminRole(null);
      }
    } catch {
      setIsAdmin(false);
      setAdminRole(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await fetchProfile(currentUser.id);
      await checkAdminStatus(currentUser.id);
    }
  }, [fetchProfile, checkAdminStatus]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
        await checkAdminStatus(currentSession.user.id);
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
          await checkAdminStatus(newSession.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setAdminRole(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, checkAdminStatus]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setAdminRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, adminRole, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
