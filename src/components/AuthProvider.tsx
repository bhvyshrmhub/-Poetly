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

  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        return;
      }

      // Self-healing: if no profile exists for authenticated user, create default profile row
      const userObj = currentUser || (await supabase.auth.getUser()).data.user;
      if (userObj && userObj.id === userId) {
        const candidateUsername = (
          userObj.user_metadata?.user_name ||
          (userObj.email ? userObj.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") : "")
        ).slice(0, 15) || `writer_${userId.substring(0, 6)}`;

        const displayName =
          userObj.user_metadata?.full_name ||
          userObj.user_metadata?.name ||
          userObj.user_metadata?.display_name ||
          userObj.email?.split("@")[0] ||
          "Writer";

        const avatarUrl = userObj.user_metadata?.avatar_url || userObj.user_metadata?.picture || null;

        const { data: created } = await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              username: candidateUsername,
              display_name: displayName,
              profile_image: avatarUrl,
              status: "active",
            },
            { onConflict: "id" }
          )
          .select()
          .maybeSingle();

        if (created) {
          setProfile(created as Profile);
          return;
        }
      }

      setProfile(null);
    } catch {
      setProfile(null);
    }
  }, []);

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
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
      await fetchProfile(currentUser.id, currentUser);
      await checkAdminStatus(currentUser.id);
    }
  }, [fetchProfile, checkAdminStatus]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id, currentSession.user);
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
          await fetchProfile(newSession.user.id, newSession.user);
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
