import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface ExpertiseItem {
  topic: string;
  level: "basico" | "intermedio" | "avancado";
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "expert" | "researcher";
  joinedAt: string;
  contributions: number;
  debates: number;
  verified?: boolean;
  // academic
  academicLevel?: string;
  academicArea?: string;
  institution?: string;
  // professional
  profession?: string;
  organization?: string;
  bio?: string;
  // knowledge areas
  expertise?: ExpertiseItem[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User> = {
  "demo@girassol.ao": {
    id: "u1",
    name: "Ana Silveira",
    email: "demo@girassol.ao",
    avatar: "",
    role: "user",
    joinedAt: "Janeiro 2026",
    contributions: 14,
    debates: 7,
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("girasightin_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const found = MOCK_USERS[email.toLowerCase()] ?? {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      avatar: "",
      role: "user" as const,
      joinedAt: "Maio 2026",
      contributions: 0,
      debates: 0,
    };
    localStorage.setItem("girasightin_user", JSON.stringify(found));
    setUser(found);
  };

  const register = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 900));
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      avatar: "",
      role: "user",
      joinedAt: "Maio 2026",
      contributions: 0,
      debates: 0,
    };
    localStorage.setItem("girasightin_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("girasightin_user");
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem("girasightin_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
