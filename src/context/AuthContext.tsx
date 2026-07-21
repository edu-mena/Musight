import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api, type ApiUser } from "../lib/apiClient";

export interface ExpertiseItem {
  topic: string;
  level: "basico" | "intermedio" | "avancado";
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "expert" | "researcher" | "admin";
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
  website?: string;
  linkedin?: string;
  // knowledge areas
  expertise?: ExpertiseItem[];
  // researcher application
  appliedForResearcher?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function transformUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? "",
    role: u.role as User["role"],
    joinedAt: u.createdAt ?? "",
    contributions: u.contributions ?? 0,
    debates: u.debatesCount ?? 0,
    verified: Boolean(u.verified),
    bio: u.bio ?? undefined,
    academicLevel: u.academicLevel ?? undefined,
    academicArea: u.academicArea ?? undefined,
    institution: u.institution ?? undefined,
    profession: u.profession ?? undefined,
    organization: u.organization ?? undefined,
    website: u.website ?? undefined,
    linkedin: u.linkedin ?? undefined,
    expertise: u.expertise ?? [],
    appliedForResearcher: Boolean(u.appliedForResearcher),
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("girasightin_token")));

  useEffect(() => {
    const token = localStorage.getItem("girasightin_token");
    if (!token) return;
    // GET /auth/me devolve { data: { user: {...} } } — o envelope tem uma
    // chave "user" dentro de data, não é o utilizador direto.
    api
      .get<{ user: ApiUser }>("/auth/me")
      .then((res) => setUser(transformUser(res.user)))
      .catch(() => {
        localStorage.removeItem("girasightin_token");
        localStorage.removeItem("girasightin_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: ApiUser }>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("girasightin_token", data.token);
    const transformed = transformUser(data.user);
    localStorage.setItem("girasightin_user", JSON.stringify(transformed));
    setUser(transformed);
  };

  const loginWithGoogle = async (credential: string) => {
    const data = await api.post<{ token: string; user: ApiUser }>("/auth/google", {
      credential,
    });
    localStorage.setItem("girasightin_token", data.token);
    const transformed = transformUser(data.user);
    localStorage.setItem("girasightin_user", JSON.stringify(transformed));
    setUser(transformed);
  };

  const register = async (name: string, email: string, password: string) => {
    // O backend NÃO devolve token no registo — a conta só fica ativa depois da
    // confirmação por email. Não autentica automaticamente aqui: quem chama
    // esta função deve navegar para a página de "verifica o teu email" a
    // seguir, sem esperar que o utilizador fique logado.
    await api.post<{ user: ApiUser; message?: string }>("/auth/register", {
      name,
      email,
      password,
    });
  };

  const logout = () => {
    localStorage.removeItem("girasightin_token");
    localStorage.removeItem("girasightin_user");
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem("girasightin_user", JSON.stringify(updated));
    setUser(updated);
  };

  const refreshUser = async () => {
    // Mesmo formato de envelope do efeito inicial — { data: { user: {...} } }.
    const res = await api.get<{ user: ApiUser }>("/auth/me");
    const transformed = transformUser(res.user);
    localStorage.setItem("girasightin_user", JSON.stringify(transformed));
    setUser(transformed);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook must live alongside its provider/context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
