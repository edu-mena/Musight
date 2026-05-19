const BASE_URL = import.meta.env.VITE_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiAuthor {
  id: number;
  name: string;
  role: string;
  verified: boolean;
}

export interface ApiComment {
  id: number;
  author: ApiAuthor;
  text: string;
  side: "favor" | "neutro" | "contra";
  likes: number;
  time: string;
  user_liked: boolean;
}

export interface ApiArticle {
  id: number;
  title: string;
  category: string;
  excerpt: string | null;
  date: string;
  author: ApiAuthor;
  has_audio: boolean;
  audio_duration: string | null;
  audio_src?: string | null;
  image?: string | null;
  has_references: boolean;
  views: number;
  comment_count?: number;
  status: string;
  rejection_reason?: string | null;
  levels?: Array<{
    id: "basico" | "intermedio" | "avancado";
    label: string;
    sublabel: string;
    text: string;
  }>;
  key_terms?: Array<{ term: string; definition: string }>;
  references?: Array<{ label: string; url?: string }>;
}

export interface ApiDebate {
  id: number;
  title: string;
  category: string;
  summary: string;
  author: ApiAuthor;
  participants: number;
  experts: number;
  date: string;
  hot: boolean;
  status: string;
  comment_count?: number;
  rejection_reason?: string | null;
  initial_argument?: string | null;
  stance?: string;
  comments?: ApiComment[];
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  suspended: boolean;
  bio: string | null;
  academic_level: string | null;
  academic_area: string | null;
  institution: string | null;
  profession: string | null;
  organization: string | null;
  website: string | null;
  linkedin: string | null;
  expertise: Array<{ topic: string; level: "basico" | "intermedio" | "avancado" }>;
  contributions: number;
  debates_count: number;
  applied_for_researcher: boolean;
  joinedAt: string;
}

export interface AdminStats {
  total_users: number;
  users_this_month: number;
  articles_in_review: number;
  debates_in_review: number;
  total_published: number;
  total_debates: number;
  pending_applications: number;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("girasightin_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!json.success) {
    // Token expired or invalid — clear auth
    if (res.status === 401) {
      localStorage.removeItem("girasightin_token");
      localStorage.removeItem("girasightin_user");
      window.location.href = "/login";
    }
    throw new Error(json.error ?? "Erro desconhecido");
  }

  return json.data as T;
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),

  putForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "PUT", body: form }),
};
