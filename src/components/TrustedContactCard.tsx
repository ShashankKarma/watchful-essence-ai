import { Phone, Mail, Star, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { TrustedContact } from "@/lib/types";

export function TrustedContactCard({
  contact,
  onEdit,
  onDelete,
  onMakePrimary,
  onToggleNotifications,
}: {
  contact: TrustedContact;
  onEdit: () => void;
  onDelete: () => void;
  onMakePrimary: () => void;
  onToggleNotifications: (enabled: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold">{contact.name}</h3>
            {contact.priority === 1 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-caution/40 bg-caution/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-caution">
                <Star className="h-3 w-3" /> Primary
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            aria-label={`Edit ${contact.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            aria-label={`Delete ${contact.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm text-foreground/80">
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" /> {contact.phone}
        </p>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" /> {contact.email}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={contact.notificationEnabled}
            onCheckedChange={onToggleNotifications}
            aria-label="Notifications"
          />
          Notifications
        </label>
        {contact.priority !== 1 ? (
          <button onClick={onMakePrimary} className="text-sm font-semibold text-accent">
            Set primary
          </button>
        ) : null}
      </div>
    </div>
  );
}
