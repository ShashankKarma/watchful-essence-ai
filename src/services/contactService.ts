import { apiClient, call } from "./apiClient";
import { db, save, uid } from "@/lib/demoStore";
import { currentUserId } from "./session";
import type { TrustedContact } from "@/lib/types";

export type TrustedContactRequest = Omit<TrustedContact, "id" | "userId" | "createdAt">;

export const contactService = {
  list(): Promise<TrustedContact[]> {
    return call(
      () => apiClient.get("/api/contacts"),
      () =>
        db()
          .contacts.filter((c) => c.userId === currentUserId())
          .sort((a, b) => a.priority - b.priority),
    );
  },

  create(payload: TrustedContactRequest): Promise<TrustedContact> {
    return call(
      () => apiClient.post("/api/contacts", payload),
      () => {
        const data = db();
        const contact: TrustedContact = {
          ...payload,
          id: uid(),
          userId: currentUserId(),
          createdAt: new Date().toISOString(),
        };
        data.contacts.push(contact);
        save();
        return contact;
      },
    );
  },

  update(id: string, payload: Partial<TrustedContactRequest>): Promise<TrustedContact> {
    return call(
      () => apiClient.put(`/api/contacts/${id}`, payload),
      () => {
        const data = db();
        const contact = data.contacts.find((c) => c.id === id);
        if (!contact) throw new Error("Contact not found");
        Object.assign(contact, payload);
        save();
        return contact;
      },
    );
  },

  remove(id: string): Promise<{ success: boolean }> {
    return call(
      () => apiClient.delete(`/api/contacts/${id}`),
      () => {
        const data = db();
        data.contacts = data.contacts.filter((c) => c.id !== id);
        save();
        return { success: true };
      },
    );
  },

  makePrimary(id: string): Promise<{ success: boolean }> {
    return call(
      () => apiClient.put(`/api/contacts/${id}`, { priority: 1 }),
      () => {
        const data = db();
        const mine = data.contacts.filter((c) => c.userId === currentUserId());
        let next = 2;
        mine.forEach((c) => {
          c.priority = c.id === id ? 1 : next++;
        });
        save();
        return { success: true };
      },
    );
  },
};
