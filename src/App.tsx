import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AppShell } from "./components/layout/AppShell";
import { Home } from "./pages/app/Home";
import { Debates } from "./pages/app/Debates";
import { DebateDetail } from "./pages/app/DebateDetail";
import { Articles } from "./pages/app/Articles";
import { ArticleDetail } from "./pages/app/ArticleDetail";
import { AIChat } from "./pages/app/AIChat";
import { Profile } from "./pages/app/Profile";
import { Policies } from "./pages/Policies";
import { ResearcherShell } from "./components/layout/ResearcherShell";
import { ResearcherHome } from "./pages/researcher/ResearcherHome";
import { MyContent } from "./pages/researcher/MyContent";
import { PublishArticle } from "./pages/researcher/PublishArticle";
import { PublishDebate } from "./pages/researcher/PublishDebate";
import { ResearcherProfile } from "./pages/researcher/ResearcherProfile";
import { AdminShell } from "./components/layout/AdminShell";
import { AdminHome } from "./pages/admin/AdminHome";
import { ManageUsers } from "./pages/admin/ManageUsers";
import { ManageArticles } from "./pages/admin/ManageArticles";
import { ManageDebates } from "./pages/admin/ManageDebates";
import type { ReactNode } from "react";

const Protected = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ResearcherProtected = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "researcher" && user.role !== "expert") return <Navigate to="/app" replace />;
  return <>{children}</>;
};

const AdminProtected = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/app" replace />;
  return <>{children}</>;
};

const AdminLayout = () => (
  <AdminProtected>
    <AdminShell>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="utilizadores" element={<ManageUsers />} />
        <Route path="artigos" element={<ManageArticles />} />
        <Route path="debates" element={<ManageDebates />} />
      </Routes>
    </AdminShell>
  </AdminProtected>
);

const ResearcherLayout = () => (
  <ResearcherProtected>
    <ResearcherShell>
      <Routes>
        <Route index element={<ResearcherHome />} />
        <Route path="conteudos" element={<MyContent />} />
        <Route path="publicar-artigo" element={<PublishArticle />} />
        <Route path="criar-debate" element={<PublishDebate />} />
        <Route path="perfil" element={<ResearcherProfile />} />
      </Routes>
    </ResearcherShell>
  </ResearcherProtected>
);

const AppLayout = () => (
  <Protected>
    <AppShell>
      <Routes>
        <Route index element={<Home />} />
        <Route path="debates" element={<Debates />} />
        <Route path="debates/:id" element={<DebateDetail />} />
        <Route path="artigos" element={<Articles />} />
        <Route path="artigos/:id" element={<ArticleDetail />} />
        <Route path="ia" element={<AIChat />} />
        <Route path="perfil" element={<Profile />} />
      </Routes>
    </AppShell>
  </Protected>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/politicas" element={<Policies />} />
          <Route path="/app/*" element={<AppLayout />} />
          <Route path="/researcher/*" element={<ResearcherLayout />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
