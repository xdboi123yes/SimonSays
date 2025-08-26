import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

// Basic user data structure
interface User {
  id: string;
  email: string;
  username: string;
}

// Authentication context interface defining all auth-related operations
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username || "",
        });
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch and validate current session
  const checkAuth = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      setSession(session);

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username || "",
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle user login with email and password
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      setSession(data.session);
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username || "",
        });
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Register new user account
  const register = async (
    email: string,
    password: string,
    username: string,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        return { error };
      }

      setSession(data.session);
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          username: username,
        });
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out current user
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Update user profile information
  const updateUser = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: {
          username: data.username,
          email: data.email,
        },
      });

      if (error) throw error;

      if (user) {
        setUser({
          ...user,
          ...data,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Prepare context value with all authentication state and methods
  const value = {
    user,
    session,
    isAuthenticated: !!session,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
