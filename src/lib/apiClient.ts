import { env } from "./env";

const BASE_URL = env.VITE_API_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Traz os tipos de resposta e payload para o contrato do backend documentado no
// guia de migração. Os nomes de campo foram alinhados com o formato esperado.
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiAuthor {
  id: number;
  name: string;
  role: "user" | "researcher" | "expert" | "admin";
  verified: boolean;
}

export interface ApiComment {
  id: number;
  debateId: number;
  userId: number;
  content: string;
  side: "favor" | "neutro" | "contra";
  likes: number;
  createdAt: string;
  author: ApiUser;
  userLiked: boolean;
}

export interface ApiArticleLevel {
  level: "basico" | "intermedio" | "avancado";
  label: string;
  sublabel?: string;
  content: string;
}

export interface ApiArticleKeyTerm {
  term: string;
  definition: string;
}

export interface ApiArticleReference {
  label: string;
  url?: string;
}

export interface ApiArticle {
  id: number;
  authorId: number;
  title: string;
  category: string;
  excerpt: string | null;
  articleDate: string | null;
  status: "rascunho" | "em_revisao" | "publicado" | "recusado";
  rejectionReason: string | null;
  hasAudio: boolean;
  audioDuration: string | null;
  audioSrc: string | null;
  image: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  levels?: ApiArticleLevel[];
  keyTerms?: ApiArticleKeyTerm[];
  references?: ApiArticleReference[];
}

export interface ApiDebate {
  id: number;
  authorId: number;
  title: string;
  category: string;
  summary: string;
  stance: "favor" | "neutro" | "contra";
  initialArgument: string | null;
  status: "rascunho" | "em_revisao" | "publicado" | "recusado";
  rejectionReason: string | null;
  participants: number;
  expertsCount: number;
  hot: boolean;
  debateDate: string | null;
  createdAt: string;
  updatedAt: string;
  invitedExperts?: Array<{ id: number; name: string }>;
  comments?: ApiComment[];
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "researcher" | "expert" | "admin";
  verified: boolean;
  suspended: boolean;
  avatar: string | null;
  bio: string | null;
  academicLevel: string | null;
  academicArea: string | null;
  institution: string | null;
  profession: string | null;
  organization: string | null;
  website: string | null;
  linkedin: string | null;
  appliedForResearcher: boolean;
  researcherFocusArea: string | null;
  researcherMotivation: string | null;
  portfolioUrl: string | null;
  contributions: number;
  debatesCount: number;
  createdAt: string;
  updatedAt: string;
  expertise: Array<{ topic: string; level: "basico" | "intermedio" | "avancado" }>;
}

export interface AdminStats {
  totalUsers: number;
  usersThisMonth: number;
  articlesInReview: number;
  debatesInReview: number;
  totalPublished: number;
  totalDebates: number;
  pendingApplications: number;
}

export interface Paginated<T> {
  articles?: T[];
  debates?: T[];
  users?: T[];
  page?: number;
  limit?: number;
  total?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  academicLevel?: string;
  academicArea?: string;
  institution?: string;
  profession?: string;
  organization?: string;
  website?: string;
  linkedin?: string;
  expertise?: Array<{ topic: string; level: "basico" | "intermedio" | "avancado" }>;
}

export interface ApplyResearcherPayload {
  focusArea: string;
  motivation: string;
  portfolioUrl?: string;
}

export interface CreateArticlePayload {
  title: string;
  category: string;
  excerpt: string;
  articleDate: string;
  levels: Array<{
    level: "basico" | "intermedio" | "avancado";
    label: string;
    sublabel?: string;
    content: string;
  }>;
  keyTerms: Array<{ term: string; definition: string }>;
  references: Array<{ label: string; url?: string }>;
}

export interface CreateDebatePayload {
  title: string;
  category: string;
  summary: string;
  stance: "favor" | "neutro" | "contra";
  initialArgument?: string;
  invitedExperts: string[];
}

export interface AddCommentPayload {
  text: string;
  side: "favor" | "neutro" | "contra";
}

// ─── Core fetch wrapper (envelope { success, data, error } já confirmado) ─────

function getToken(): string | null {
  return localStorage.getItem("girasightin_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!json.success) {
    // Só força logout + redirect se havia uma sessão ativa que expirou.
    // No próprio endpoint de login, um 401 só significa "senha errada" —
    // não deve disparar navegação nenhuma, só mostrar o erro no formulário.
    const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/register");

    if (res.status === 401 && token && !isAuthEndpoint) {
      localStorage.removeItem("girasightin_token");
      localStorage.removeItem("girasightin_user");
      window.location.href = "/login";
    }

    throw new Error(json.error ?? "Erro desconhecido");
  }

  return json.data as T;
}

function qs(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

// ─── Cliente genérico (mantido para casos não cobertos abaixo) ────────────────

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
  putForm: <T>(path: string, form: FormData) => request<T>(path, { method: "PUT", body: form }),
};

// ─── Endpoints tipados (espelham 1:1 o painel index.html) ─────────────────────

export const authApi = {
  register: (body: RegisterPayload) => api.post<{ message?: string }>("/auth/register", body),
  confirm: (token: string) =>
    api.get<{ message?: string }>(`/auth/confirm/${encodeURIComponent(token)}`),
  resendConfirmation: (email: string) =>
    api.post<{ message?: string }>("/auth/resend-confirmation", { email }),
  login: (body: LoginPayload) => api.post<{ token: string; user: ApiUser }>("/auth/login", body),
  logout: () => api.post<{ message?: string }>("/auth/logout", {}),
  me: () => api.get<{ user: ApiUser }>("/auth/me"),
  forgotPassword: (email: string) =>
    api.post<{ message?: string }>("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post<{ message?: string }>("/auth/reset-password", { token, password }),
};

export const usersApi = {
  updateProfile: (body: UpdateProfilePayload) => api.put<ApiUser>("/users/profile", body),
  applyResearcher: (body: ApplyResearcherPayload) =>
    api.post<{ message?: string }>("/users/apply-researcher", body),
};

export const articlesApi = {
  // público
  list: (page = 1, limit = 10, category?: string) =>
    api.get<Paginated<ApiArticle>>(`/articles${qs({ page, limit, category })}`),
  get: (id: number | string) => api.get<ApiArticle>(`/articles/${encodeURIComponent(String(id))}`),
};

export const researcherArticlesApi = {
  list: (page = 1, limit = 10) =>
    api.get<Paginated<ApiArticle>>(`/researcher/articles${qs({ page, limit })}`),
  create: (body: CreateArticlePayload) => api.post<ApiArticle>("/researcher/articles", body),
  remove: (id: number | string) =>
    api.delete<{ message?: string }>(`/researcher/articles/${encodeURIComponent(String(id))}`),
};

export const debatesApi = {
  list: (page = 1, limit = 10) => api.get<Paginated<ApiDebate>>(`/debates${qs({ page, limit })}`),
  get: (id: number | string) => api.get<ApiDebate>(`/debates/${encodeURIComponent(String(id))}`),
  addComment: (id: number | string, body: AddCommentPayload) =>
    api.post<ApiComment>(`/debates/${encodeURIComponent(String(id))}/comments`, body),
};

export const researcherDebatesApi = {
  list: (page = 1, limit = 10) =>
    api.get<Paginated<ApiDebate>>(`/researcher/debates${qs({ page, limit })}`),
  create: (body: CreateDebatePayload) => api.post<ApiDebate>("/researcher/debates", body),
  remove: (id: number | string) =>
    api.delete<{ message?: string }>(`/researcher/debates/${encodeURIComponent(String(id))}`),
};

export const commentsApi = {
  toggleLike: (id: number | string) =>
    api.post<{ liked: boolean; likes: number }>(
      `/comments/${encodeURIComponent(String(id))}/like`,
      {},
    ),
};

export const wezaApi = {
  ask: (question: string) => api.post<{ answer: string }>("/weza", { question }),
};

export const adminApi = {
  stats: () => api.get<AdminStats>("/admin/stats"),
  users: (page = 1, limit = 10) =>
    api.get<Paginated<ApiUser>>(`/admin/users${qs({ page, limit })}`),
  articles: (status: string) => api.get<ApiArticle[]>(`/admin/articles${qs({ status })}`),
  approveArticle: (id: number | string) =>
    api.put<ApiArticle>(`/admin/articles/${encodeURIComponent(String(id))}/approve`, {}),
  rejectArticle: (id: number | string, reason: string) =>
    api.put<ApiArticle>(`/admin/articles/${encodeURIComponent(String(id))}/reject`, { reason }),
  debates: (status: string) => api.get<ApiDebate[]>(`/admin/debates${qs({ status })}`),
  approveDebate: (id: number | string) =>
    api.put<ApiDebate>(`/admin/debates/${encodeURIComponent(String(id))}/approve`, {}),
  rejectDebate: (id: number | string, reason: string) =>
    api.put<ApiDebate>(`/admin/debates/${encodeURIComponent(String(id))}/reject`, { reason }),
};
