import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout, Field } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — GuardianAI" },
      {
        name: "description",
        content: "Create your GuardianAI account and start proactive safety monitoring.",
      },
      { property: "og:title", content: "Create account — GuardianAI" },
      {
        property: "og:description",
        content: "Create your GuardianAI account and start proactive safety monitoring.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    emergencyPin: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <AuthLayout title="Create your account" subtitle="A few details to personalise your safety profile.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
          }
          if (!/^\d{4}$/.test(form.emergencyPin)) {
            toast.error("Emergency PIN must be 4 digits");
            return;
          }
          setLoading(true);
          try {
            await register(form);
            toast.success("Account created");
            void navigate({ to: "/dashboard" });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Registration failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Field label="Full name" value={form.name} onChange={set("name")} />
        <Field label="Email" type="email" value={form.email} onChange={set("email")} />
        <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="+91 90000 00000" />
        <Field label="Password" type="password" value={form.password} onChange={set("password")} />
        <Field
          label="Emergency PIN (4 digits)"
          value={form.emergencyPin}
          onChange={set("emergencyPin")}
          placeholder="4321"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-display font-bold text-primary-foreground disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Create account
        </button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="text-accent">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
