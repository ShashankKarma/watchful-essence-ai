import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { AuthLayout, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — GuardianAI" },
      { name: "description", content: "Request a password reset link for your GuardianAI account." },
      { property: "og:title", content: "Reset password — GuardianAI" },
      {
        property: "og:description",
        content: "Request a password reset link for your GuardianAI account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send reset instructions to your email.">
      {sent ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          If an account exists for {email}, reset instructions would be sent. Email delivery is
          simulated in this demo build.
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await authService.forgotPassword(email);
            toast.success(res.message);
            setSent(true);
          }}
        >
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-display font-bold text-primary-foreground"
          >
            Send reset link
          </button>
        </form>
      )}
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-accent">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
