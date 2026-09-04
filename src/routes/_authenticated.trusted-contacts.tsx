import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/PageHeader";
import { TrustedContactCard } from "@/components/TrustedContactCard";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { Field } from "@/routes/login";
import { contactService } from "@/services/contactService";
import type { TrustedContact } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/trusted-contacts")({
  head: () => ({
    meta: [
      { title: "Trusted Contacts — GuardianAI" },
      {
        name: "description",
        content: "Manage the people GuardianAI notifies during an emergency escalation.",
      },
      { property: "og:title", content: "Trusted Contacts — GuardianAI" },
      {
        property: "og:description",
        content: "Manage the people GuardianAI notifies during an emergency escalation.",
      },
    ],
  }),
  component: TrustedContactsPage,
});

const blank = { name: "", relationship: "", phone: "", email: "", priority: 2, notificationEnabled: true };

function TrustedContactsPage() {
  const [contacts, setContacts] = useState<TrustedContact[] | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TrustedContact | null>(null);
  const [form, setForm] = useState(blank);

  const load = () => contactService.list().then(setContacts);
  useEffect(() => {
    void load();
  }, []);

  const set = (key: keyof typeof blank) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <PageHeader
        title="Trusted contacts"
        description="Prioritised contacts are notified in-app when an emergency event is created."
        action={
          <button
            onClick={() => {
              setEditing(null);
              setForm(blank);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <UserPlus className="h-4 w-4" /> Add contact
          </button>
        }
      />

      {contacts === null ? (
        <LoadingState />
      ) : contacts.length === 0 ? (
        <EmptyState
          title="No trusted contacts yet"
          description="Add at least one person who should be alerted in an emergency."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((c) => (
            <TrustedContactCard
              key={c.id}
              contact={c}
              onEdit={() => {
                setEditing(c);
                setForm({
                  name: c.name,
                  relationship: c.relationship,
                  phone: c.phone,
                  email: c.email,
                  priority: c.priority,
                  notificationEnabled: c.notificationEnabled,
                });
                setOpen(true);
              }}
              onDelete={async () => {
                await contactService.remove(c.id);
                await load();
                toast("Contact removed");
              }}
              onMakePrimary={async () => {
                await contactService.makePrimary(c.id);
                await load();
                toast.success(`${c.name} is now your primary contact`);
              }}
              onToggleNotifications={async (enabled) => {
                await contactService.update(c.id, { notificationEnabled: enabled });
                await load();
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit contact" : "Add trusted contact"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (editing) {
                await contactService.update(editing.id, form);
                toast.success("Contact updated");
              } else {
                await contactService.create({ ...form, priority: Number(form.priority) || 2 });
                toast.success("Contact added");
              }
              setOpen(false);
              await load();
            }}
          >
            <Field label="Name" value={form.name} onChange={set("name")} />
            <Field label="Relationship" value={form.relationship} onChange={set("relationship")} />
            <Field label="Phone" value={form.phone} onChange={set("phone")} />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} />
            <Field
              label="Priority (1 = primary)"
              type="number"
              value={String(form.priority)}
              onChange={(v) => setForm((f) => ({ ...f, priority: Number(v) }))}
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 font-display font-bold text-primary-foreground"
            >
              {editing ? "Save changes" : "Add contact"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
