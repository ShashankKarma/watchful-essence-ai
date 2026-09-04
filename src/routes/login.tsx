import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — GuardianAI" },
      { name: "description", content: "Sign in to your GuardianAI safety dashboard." },
      { property: "og:title", content: "Sign in — GuardianAI" },
      { property: "og:description", content: "Sign in to your GuardianAI safety dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@guardianai.local");
  const [password, setPassword] = useState("Demo@1234");
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue proactive safety monitoring.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const user = await login(email, password);
            toast.success(`Signed in as ${user.name}`);
            void navigate({ to: user.role === "ADMIN" ? "/admin" : "/dashboard" });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Sign in failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-display font-bold text-primary-foreground disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Sign in
        </button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-accent">
          Forgot password?
        </Link>
        <Link to="/register" className="text-muted-foreground">
          Create account
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Demo accounts</p>
        <p>User — demo@guardianai.local / Demo@1234</p>
        <p>Admin — admin@guardianai.local / Admin@1234</p>
        <p>Trusted contact — contact@guardianai.local / Contact@1234</p>
      </div>
    </AuthLayout>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-7 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">GuardianAI</span>
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
      />
    </label>
  );
}
