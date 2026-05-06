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
import type { ReactNode } from "react";

const Protected = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

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
          <Route path="/app/*" element={<AppLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
