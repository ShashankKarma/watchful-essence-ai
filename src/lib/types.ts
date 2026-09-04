export type Role = "USER" | "TRUSTED_CONTACT" | "ADMIN";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ActivityType = "WALKING" | "RUNNING" | "STATIONARY" | "TRAVELLING" | "IDLE";
export type TriggerType = "MANUAL_SOS" | "AI_DETECTION" | "AUTO_ESCALATION";
export type EmergencyStatus = "ACTIVE" | "RESOLVED" | "CANCELLED" | "AUTO_ESCALATED";
export type AlertResponse = "PENDING" | "SAFE" | "NEED_HELP" | "NO_RESPONSE";
export type AlertStatus = "OPEN" | "RESOLVED" | "ESCALATED";
export type NotificationType = "INFO" | "WARNING" | "HIGH_RISK" | "EMERGENCY" | "SYSTEM";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: Role;
  emergencyPin?: string;
  monitoringEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  priority: number;
  notificationEnabled: boolean;
  createdAt: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  label: string;
}

export interface DigitalTwin {
  id: string;
  userId: string;
  baselineActiveHours: number[];
  baselineMovementDuration: number;
  baselineActivityFrequency: Record<string, number>;
  usualLocations: GeoPoint[];
  riskThreshold: number;
  learningProgress: number;
  lastUpdated: string;
}

export interface BehaviourData {
  id: string;
  userId: string;
  activityType: ActivityType;
  timestamp: string;
  latitude: number;
  longitude: number;
  movementDuration: number;
  activityDuration: number;
  metadata?: Record<string, string>;
  simulated?: boolean;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  anomalyScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  confidence: number;
  source: "LOCAL" | "GEMINI";
  timestamp: string;
  simulated?: boolean;
}

export interface SafetyAlert {
  id: string;
  userId: string;
  riskAssessmentId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  response: AlertResponse;
  status: AlertStatus;
  createdAt: string;
  respondedAt?: string;
  simulated?: boolean;
}

export interface TimelineEntry {
  stage: string;
  detail: string;
  at: string;
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  triggerType: TriggerType;
  riskLevel: RiskLevel;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  status: EmergencyStatus;
  notifiedContactIds: string[];
  timeline: TimelineEntry[];
  simulated?: boolean;
  timestamp: string;
}

export interface LocationData {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  emergencyEventId?: string;
  type: NotificationType;
  title: string;
  message: string;
  status: "UNREAD" | "READ";
  createdAt: string;
}

export interface SafetyTip {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  createdAt: string;
}

export interface MonitoringSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  active: boolean;
  behaviourCount: number;
}

export interface UserSettings {
  userId: string;
  riskSensitivity: number;
  alertTimeoutSeconds: number;
  locationSharing: boolean;
  monitoringEnabled: boolean;
  notifyInApp: boolean;
  notifySms: boolean;
  notifyEmail: boolean;
  shareLocationWithContacts: boolean;
  storeBehaviourHistory: boolean;
}

export interface AiAnalysisResult {
  anomalyScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reasons: string[];
  source: "LOCAL" | "GEMINI";
}

export interface AdminDashboard {
  totalUsers: number;
  activeMonitoringSessions: number;
  alertsToday: number;
  highRiskEvents: number;
  emergencyEvents: number;
  riskDistribution: { level: string; count: number }[];
  alertsOverTime: { date: string; alerts: number; emergencies: number }[];
  monitoringActivity: { date: string; sessions: number }[];
}
