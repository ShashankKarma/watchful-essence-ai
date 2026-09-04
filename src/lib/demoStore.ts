import type {
  AppNotification,
  BehaviourData,
  DigitalTwin,
  EmergencyEvent,
  LocationData,
  MonitoringSession,
  RiskAssessment,
  SafetyAlert,
  SafetyTip,
  TrustedContact,
  User,
  UserSettings,
} from "./types";

/**
 * Local demo backend.
 *
 * The React app talks to the Spring Boot API when VITE_API_BASE_URL is set.
 * When it is not (preview / offline demo), every service falls back to this
 * localStorage-backed store so the full workflow stays demonstrable.
 */

const KEY = "guardianai.db.v2";

export interface Db {
  users: User[];
  contacts: TrustedContact[];
  twins: DigitalTwin[];
  behaviour: BehaviourData[];
  risks: RiskAssessment[];
  alerts: SafetyAlert[];
  emergencies: EmergencyEvent[];
  locations: LocationData[];
  notifications: AppNotification[];
  tips: SafetyTip[];
  sessions: MonitoringSession[];
  settings: UserSettings[];
  session: { token: string; userId: string } | null;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const iso = (d: Date) => d.toISOString();
const hoursAgo = (h: number) => iso(new Date(Date.now() - h * 3600_000));

const BASE = { lat: 12.9716, lng: 77.5946 };

const DEMO_USER_ID = "u-demo";
const ADMIN_ID = "u-admin";
const CONTACT_USER_ID = "u-contact";

function seed(): Db {
  const now = new Date();
  const users: User[] = [
    {
      id: DEMO_USER_ID,
      name: "Demo User",
      email: "demo@guardianai.local",
      phone: "+91 90000 00001",
      password: "Demo@1234",
      role: "USER",
      emergencyPin: "4321",
      monitoringEnabled: false,
      createdAt: hoursAgo(24 * 40),
      updatedAt: iso(now),
    },
    {
      id: ADMIN_ID,
      name: "Admin",
      email: "admin@guardianai.local",
      phone: "+91 90000 00002",
      password: "Admin@1234",
      role: "ADMIN",
      monitoringEnabled: false,
      createdAt: hoursAgo(24 * 60),
      updatedAt: iso(now),
    },
    {
      id: CONTACT_USER_ID,
      name: "Priya (Trusted Contact)",
      email: "contact@guardianai.local",
      phone: "+91 90000 00003",
      password: "Contact@1234",
      role: "TRUSTED_CONTACT",
      monitoringEnabled: false,
      createdAt: hoursAgo(24 * 30),
      updatedAt: iso(now),
    },
  ];

  const contacts: TrustedContact[] = [
    {
      id: "c-1",
      userId: DEMO_USER_ID,
      name: "Priya Sharma",
      relationship: "Sister",
      phone: "+91 90000 00003",
      email: "contact@guardianai.local",
      priority: 1,
      notificationEnabled: true,
      createdAt: hoursAgo(24 * 30),
    },
    {
      id: "c-2",
      userId: DEMO_USER_ID,
      name: "Anita Rao",
      relationship: "Roommate",
      phone: "+91 90000 00004",
      email: "anita@guardianai.local",
      priority: 2,
      notificationEnabled: true,
      createdAt: hoursAgo(24 * 20),
    },
    {
      id: "c-3",
      userId: DEMO_USER_ID,
      name: "Campus Security Desk",
      relationship: "Institution",
      phone: "+91 90000 00005",
      email: "security@guardianai.local",
      priority: 3,
      notificationEnabled: false,
      createdAt: hoursAgo(24 * 10),
    },
  ];

  const activities: BehaviourData["activityType"][] = [
    "WALKING",
    "STATIONARY",
    "TRAVELLING",
    "IDLE",
    "WALKING",
    "STATIONARY",
  ];
  const behaviour: BehaviourData[] = [];
  for (let i = 0; i < 60; i++) {
    const t = new Date(Date.now() - i * 3 * 3600_000);
    const hour = t.getHours();
    if (hour < 7 || hour > 22) continue;
    behaviour.push({
      id: `b-${i}`,
      userId: DEMO_USER_ID,
      activityType: activities[i % activities.length]!,
      timestamp: iso(t),
      latitude: BASE.lat + ((i % 5) - 2) * 0.004,
      longitude: BASE.lng + ((i % 4) - 2) * 0.004,
      movementDuration: 18 + (i % 7) * 3,
      activityDuration: 25 + (i % 5) * 6,
    });
  }

  const freq: Record<string, number> = {};
  behaviour.forEach((b) => (freq[b.activityType] = (freq[b.activityType] ?? 0) + 1));

  const twins: DigitalTwin[] = [
    {
      id: "dt-1",
      userId: DEMO_USER_ID,
      baselineActiveHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      baselineMovementDuration: 24,
      baselineActivityFrequency: freq,
      usualLocations: [
        { latitude: BASE.lat, longitude: BASE.lng, label: "Home" },
        { latitude: BASE.lat + 0.02, longitude: BASE.lng + 0.018, label: "College" },
        { latitude: BASE.lat - 0.012, longitude: BASE.lng + 0.009, label: "Metro Station" },
      ],
      riskThreshold: 61,
      learningProgress: Math.min(100, behaviour.length * 2),
      lastUpdated: iso(now),
    },
  ];

  const risks: RiskAssessment[] = [];
  const scores = [12, 18, 24, 41, 22, 15, 58, 33, 19, 74, 28, 21];
  scores.forEach((s, i) => {
    risks.push({
      id: `r-${i}`,
      userId: DEMO_USER_ID,
      anomalyScore: s,
      riskLevel: s <= 30 ? "LOW" : s <= 60 ? "MEDIUM" : s <= 80 ? "HIGH" : "CRITICAL",
      reasons:
        s > 60
          ? ["Unusual location", "Activity outside normal hours"]
          : ["Behaviour matches your normal pattern"],
      confidence: 0.82,
      source: "LOCAL",
      timestamp: hoursAgo((scores.length - i) * 6),
    });
  });

  const alerts: SafetyAlert[] = [
    {
      id: "a-1",
      userId: DEMO_USER_ID,
      riskAssessmentId: "r-9",
      riskScore: 74,
      riskLevel: "HIGH",
      reasons: ["Unusual location — 4.2 km from your familiar places", "Activity outside normal hours"],
      response: "SAFE",
      status: "RESOLVED",
      createdAt: hoursAgo(18),
      respondedAt: hoursAgo(17.9),
    },
    {
      id: "a-2",
      userId: DEMO_USER_ID,
      riskAssessmentId: "r-6",
      riskScore: 58,
      riskLevel: "MEDIUM",
      reasons: ["Movement duration much longer than your baseline"],
      response: "SAFE",
      status: "RESOLVED",
      createdAt: hoursAgo(42),
      respondedAt: hoursAgo(41.9),
    },
  ];

  const locations: LocationData[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `l-${i}`,
    userId: DEMO_USER_ID,
    latitude: BASE.lat + i * 0.002,
    longitude: BASE.lng + i * 0.0015,
    accuracy: 12 + i,
    timestamp: hoursAgo(8 - i),
  }));

  const emergencies: EmergencyEvent[] = [
    {
      id: "e-1",
      userId: DEMO_USER_ID,
      triggerType: "AUTO_ESCALATION",
      riskLevel: "CRITICAL",
      latitude: BASE.lat + 0.03,
      longitude: BASE.lng - 0.02,
      status: "RESOLVED",
      notifiedContactIds: ["c-1", "c-2"],
      simulated: true,
      timestamp: hoursAgo(72),
      timeline: [
        { stage: "Detection", detail: "Anomaly score 86 — CRITICAL", at: hoursAgo(72) },
        { stage: "Alert", detail: "Safety alert shown with 30s countdown", at: hoursAgo(72) },
        { stage: "User Response", detail: "No response received", at: hoursAgo(71.99) },
        { stage: "Emergency Trigger", detail: "Auto escalation started", at: hoursAgo(71.98) },
        { stage: "Contact Notification", detail: "2 trusted contacts notified (simulated)", at: hoursAgo(71.97) },
        { stage: "Resolution", detail: "Marked resolved by user", at: hoursAgo(70) },
      ],
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: "n-1",
      userId: DEMO_USER_ID,
      type: "HIGH_RISK",
      title: "Unusual activity detected",
      message: "GuardianAI detected behaviour that differs from your normal pattern (score 74).",
      status: "UNREAD",
      createdAt: hoursAgo(18),
    },
    {
      id: "n-2",
      userId: DEMO_USER_ID,
      emergencyEventId: "e-1",
      type: "EMERGENCY",
      title: "Emergency event resolved",
      message: "Your emergency event was resolved. Trusted contacts were notified (simulated).",
      status: "READ",
      createdAt: hoursAgo(70),
    },
    {
      id: "n-3",
      userId: DEMO_USER_ID,
      type: "SYSTEM",
      title: "Digital Twin updated",
      message: "Your behavioural baseline has been refreshed with recent activity.",
      status: "READ",
      createdAt: hoursAgo(30),
    },
  ];

  const tips: SafetyTip[] = [
    ["Share your live trip", "Share your route and expected arrival time with a trusted contact before you start travelling.", "Travel Safety", "route"],
    ["Verify the vehicle", "Match the number plate and driver details before boarding a cab, and sit in the rear seat.", "Travel Safety", "car"],
    ["Prefer lit routes", "Choose well-lit main roads at night even if the route is slightly longer.", "Night Travel", "moon"],
    ["Stay reachable", "Keep your phone charged above 30% and carry a small power bank for night travel.", "Night Travel", "battery"],
    ["Scan for exits", "In crowded public places, note the nearest exit and staffed help desk when you arrive.", "Public Places", "door-open"],
    ["Trust discomfort", "If a place or person feels wrong, leave early. You never owe anyone an explanation.", "Public Places", "shield"],
    ["Lock down location", "Turn off public location sharing on social apps and post travel photos after you return.", "Online Safety", "map-pin-off"],
    ["Spot social engineering", "Never share OTPs, PINs or your live address with unverified callers.", "Online Safety", "phone-off"],
    ["Rehearse the plan", "Agree a code word with family that means 'call me and stay on the line'.", "Emergency Preparedness", "message-square"],
    ["Keep the essentials", "Save local helpline numbers offline and keep an emergency PIN you can recall under stress."  , "Emergency Preparedness", "list-checks"],
    ["Audit app permissions", "Review which apps can access your microphone, camera and location every month.", "Digital Privacy", "settings"],
    ["Use strong unique keys", "Use a password manager and enable two-factor authentication on your primary email.", "Digital Privacy", "key"],
  ].map(([title, description, category, icon], i) => ({
    id: `t-${i}`,
    title: title!,
    description: description!,
    category: category!,
    icon: icon!,
    createdAt: hoursAgo(24 * 30),
  }));

  const settings: UserSettings[] = [
    {
      userId: DEMO_USER_ID,
      riskSensitivity: 1,
      alertTimeoutSeconds: 30,
      locationSharing: true,
      monitoringEnabled: false,
      notifyInApp: true,
      notifySms: false,
      notifyEmail: false,
      shareLocationWithContacts: true,
      storeBehaviourHistory: true,
    },
  ];

  const sessions: MonitoringSession[] = [
    {
      id: "s-1",
      userId: DEMO_USER_ID,
      startedAt: hoursAgo(72),
      endedAt: hoursAgo(70),
      active: false,
      behaviourCount: 24,
    },
  ];

  return {
    users,
    contacts,
    twins,
    behaviour,
    risks,
    alerts,
    emergencies,
    locations,
    notifications,
    tips,
    sessions,
    settings,
    session: null,
  };
}

let memory: Db | null = null;

export function db(): Db {
  if (typeof window === "undefined") {
    memory ??= seed();
    return memory;
  }
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    memory = raw ? (JSON.parse(raw) as Db) : seed();
  } catch {
    memory = seed();
  }
  return memory;
}

export function save(next?: Partial<Db>) {
  const current = db();
  if (next) Object.assign(current, next);
  memory = current;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* storage unavailable */
    }
  }
  notifyChange();
}

const listeners = new Set<() => void>();
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notifyChange() {
  listeners.forEach((l) => l());
}

export function resetDemoData() {
  memory = seed();
  save();
}

export const DEMO_IDS = { DEMO_USER_ID, ADMIN_ID, CONTACT_USER_ID, BASE };
