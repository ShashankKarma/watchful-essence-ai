import { apiClient, call, hasRemote, setToken, getToken } from "./apiClient";
import { db, save, uid } from "@/lib/demoStore";
import type { User } from "@/lib/types";

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  emergencyPin: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

function sanitize(user: User): User {
  const { password: _password, ...rest } = user;
  return rest as User;
}

export const authService = {
  async register(payload: RegisterRequest): Promise<LoginResponse> {
    if (hasRemote) {
      const res = await apiClient.post("/api/auth/register", payload);
      const body = res.data as { data?: LoginResponse } | LoginResponse;
      const result = (body as { data?: LoginResponse }).data ?? (body as LoginResponse);
      setToken(result.token);
      return result;
    }
    return call(
      () => apiClient.post("/api/auth/register", payload),
      () => {
        const data = db();
        if (data.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
          throw new Error("An account with this email already exists");
        }
        const now = new Date().toISOString();
        const user: User = {
          id: uid(),
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          password: payload.password,
          role: "USER",
          emergencyPin: payload.emergencyPin,
          monitoringEnabled: false,
          createdAt: now,
          updatedAt: now,
        };
        data.users.push(user);
        data.twins.push({
          id: uid(),
          userId: user.id,
          baselineActiveHours: [],
          baselineMovementDuration: 0,
          baselineActivityFrequency: {},
          usualLocations: [],
          riskThreshold: 61,
          learningProgress: 0,
          lastUpdated: now,
        });
        data.settings.push({
          userId: user.id,
          riskSensitivity: 1,
          alertTimeoutSeconds: 30,
          locationSharing: true,
          monitoringEnabled: false,
          notifyInApp: true,
          notifySms: false,
          notifyEmail: false,
          shareLocationWithContacts: true,
          storeBehaviourHistory: true,
        });
        const token = `local.${user.id}`;
        data.session = { token, userId: user.id };
        save();
        setToken(token);
        return { token, user: sanitize(user) };
      },
    );
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const result = await call<LoginResponse>(
      () => apiClient.post("/api/auth/login", { email, password }),
      () => {
        const data = db();
        const user = data.users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
        );
        if (!user) throw new Error("Invalid email or password");
        const token = `local.${user.id}`;
        data.session = { token, userId: user.id };
        save();
        return { token, user: sanitize(user) };
      },
    );
    setToken(result.token);
    return result;
  },

  async me(): Promise<User | null> {
    return call(
      () => apiClient.get("/api/auth/me"),
      () => {
        const data = db();
        const token = getToken();
        const userId = data.session?.userId ?? token?.replace("local.", "");
        const user = data.users.find((u) => u.id === userId);
        return user ? sanitize(user) : null;
      },
    );
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return call(
      () => apiClient.post("/api/auth/forgot-password", { email }),
      () => ({
        message:
          "If an account exists for this email, a reset link would be sent. (Simulated in demo mode.)",
      }),
    );
  },

  logout() {
    const data = db();
    data.session = null;
    save();
    setToken(null);
  },
};
