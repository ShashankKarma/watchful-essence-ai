import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/routes/login";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — GuardianAI" },
      { name: "description", content: "Update your personal details, emergency PIN and password." },
      { property: "og:title", content: "Profile — GuardianAI" },
      {
        property: "og:description",
        content: "Update your personal details, emergency PIN and password.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", emergencyPin: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone, emergencyPin: user.emergencyPin ?? "" });
  }, [user]);

  return (
    <div>
      <PageHeader title="Profile" description="Your GuardianAI account details." />

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="space-y-4 rounded-2xl border border-border bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (form.emergencyPin && !/^\d{4}$/.test(form.emergencyPin)) {
              toast.error("Emergency PIN must be 4 digits");
              return;
            }
            await userService.updateProfile(form);
            await refresh();
            toast.success("Profile updated");
          }}
        >
          <p className="font-display text-base font-semibold">Personal details</p>
          <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
            />
          </div>
          <Field
            label="Emergency PIN (4 digits)"
            value={form.emergencyPin}
            onChange={(v) => setForm((f) => ({ ...f, emergencyPin: v }))}
          />
          <button className="w-full rounded-xl bg-primary py-3 font-display font-bold text-primary-foreground">
            Save changes
          </button>
        </form>

        <form
          className="space-y-4 rounded-2xl border border-border bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (pw.next.length < 8) {
              toast.error("New password must be at least 8 characters");
              return;
            }
            if (pw.next !== pw.confirm) {
              toast.error("Passwords do not match");
              return;
            }
            try {
              await userService.changePassword(pw.current, pw.next);
              setPw({ current: "", next: "", confirm: "" });
              toast.success("Password changed");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not change password");
            }
          }}
        >
          <p className="font-display text-base font-semibold">Change password</p>
          <Field
            label="Current password"
            type="password"
            value={pw.current}
            onChange={(v) => setPw((p) => ({ ...p, current: v }))}
          />
          <Field
            label="New password"
            type="password"
            value={pw.next}
            onChange={(v) => setPw((p) => ({ ...p, next: v }))}
          />
          <Field
            label="Confirm new password"
            type="password"
            value={pw.confirm}
            onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
          />
          <button className="w-full rounded-xl border border-border py-3 font-display font-bold">
            Update password
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Role: <span className="font-semibold text-foreground">{user?.role}</span> · Member since{" "}
        {user ? new Date(user.createdAt).toLocaleDateString() : "—"}
      </div>
    </div>
  );
}
