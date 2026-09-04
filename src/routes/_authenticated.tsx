import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { GuardianProvider } from "@/hooks/useGuardian";
import { AppShell } from "@/layouts/AppShell";
import { LoadingState } from "@/components/StateViews";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  return (
    <GuardianProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </GuardianProvider>
  );
}
