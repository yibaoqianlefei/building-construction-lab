import { useAuth } from "../contexts/AuthContext";

export default function DeveloperRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (profile as any)?.role !== "developer") {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-lg">无权访问</p>
          <p className="text-muted-soft text-sm mt-1">仅开发者可访问此页面</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
