import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/StateViews";
import { adminService } from "@/services/adminService";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin Users — GuardianAI" },
      { name: "description", content: "Registered GuardianAI accounts and their roles." },
      { property: "og:title", content: "Admin Users — GuardianAI" },
      { property: "og:description", content: "Registered GuardianAI accounts and their roles." },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    void adminService.users().then(setUsers);
  }, []);

  if (!users) return <LoadingState />;

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Users" description="Accounts registered on this GuardianAI instance." />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, email or role"
        className="mb-4 w-full max-w-sm rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
      />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-5">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Role</th>
              <th className="py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/60">
                <td className="py-2.5 font-medium">{u.name}</td>
                <td className="py-2.5 text-muted-foreground">{u.email}</td>
                <td className="py-2.5 text-muted-foreground">{u.phone}</td>
                <td className="py-2.5">
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                    {u.role}
                  </span>
                </td>
                <td className="py-2.5 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
