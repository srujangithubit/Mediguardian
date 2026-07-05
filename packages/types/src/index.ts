// ============================================
// MediGuardian AI — Shared Type Definitions
// ============================================

// ==================== USER ====================
export interface User {
  id: string;
  supabaseAuthId: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  timezone: string;
  locale: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type BloodGroup =
  | 'A_POSITIVE' | 'A_NEGATIVE'
  | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE'
  | 'O_POSITIVE' | 'O_NEGATIVE'
  | 'UNKNOWN';

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CAREGIVER' | 'VIEWER' | 'DOCTOR';

// ==================== FAMILY ====================
export interface Family {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  allergies: string[];
  medicalNotes?: string;
  avatarUrl?: string;
  role: Role;
  isDependent: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== MEDICATION ====================
export type MedicationStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DISCONTINUED';

export type MedicationFrequency =
  | 'ONCE_DAILY' | 'TWICE_DAILY' | 'THREE_TIMES_DAILY'
  | 'FOUR_TIMES_DAILY' | 'EVERY_OTHER_DAY' | 'WEEKLY'
  | 'AS_NEEDED' | 'CUSTOM';

export type DosageUnit = 'MG' | 'ML' | 'TABLET' | 'CAPSULE' | 'DROPS' | 'UNITS' | 'PUFFS';

export type MealRelation = 'BEFORE_MEAL' | 'AFTER_MEAL' | 'WITH_MEAL' | 'EMPTY_STOMACH' | 'NO_PREFERENCE';

export type LogStatus = 'TAKEN' | 'MISSED' | 'SKIPPED' | 'LATE';

export interface Medication {
  id: string;
  familyMemberId: string;
  name: string;
  genericName?: string;
  brandName?: string;
  dosage: number;
  dosageUnit: DosageUnit;
  frequency: MedicationFrequency;
  mealRelation: MealRelation;
  instructions?: string;
  sideEffects?: string;
  startDate: string;
  endDate?: string;
  totalQuantity?: number;
  remainingQty?: number;
  refillThreshold?: number;
  status: MedicationStatus;
  prescribedBy?: string;
  prescriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduledTime: string; // HH:mm
  dayOfWeek?: number;
  isActive: boolean;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  familyMemberId: string;
  scheduledTime: string;
  actualTime?: string;
  status: LogStatus;
  dosageTaken?: number;
  notes?: string;
  loggedBy?: string;
  createdAt: string;
}

// ==================== VITALS ====================
export interface BloodPressureLog {
  id: string;
  familyMemberId: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  position?: string;
  arm?: string;
  measuredAt: string;
  notes?: string;
}

export interface SugarLog {
  id: string;
  familyMemberId: string;
  glucoseLevel: number;
  readingType: 'fasting' | 'post-meal' | 'random' | 'hba1c';
  mealContext?: string;
  measuredAt: string;
  notes?: string;
}

export interface WeightLog {
  id: string;
  familyMemberId: string;
  weightKg: number;
  heightCm?: number;
  bmi?: number;
  bodyFatPercent?: number;
  measuredAt: string;
  notes?: string;
}

// ==================== AI DIGITAL TWIN ====================
export interface DigitalTwinProfile {
  id: string;
  familyMemberId: string;
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  medicationCompliance: number;
  averageSleep: number;
  currentTrends: TrendInsight[];
  recommendations: string[];
  lastUpdated: string;
}

export interface TrendInsight {
  metric: string;
  direction: 'IMPROVING' | 'STABLE' | 'DECLINING';
  summary: string;
  possibleReasons: string[];
}

// ==================== NOTIFICATIONS ====================
export type NotificationType =
  | 'MEDICATION_REMINDER' | 'APPOINTMENT_REMINDER' | 'MISSED_DOSE'
  | 'REFILL_REMINDER' | 'HEALTH_TIP' | 'VITALS_ALERT' | 'SYSTEM';

export type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Notification {
  id: string;
  familyMemberId: string;
  type: NotificationType;
  title: string;
  body: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

// ==================== APPOINTMENTS ====================
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  familyMemberId: string;
  doctorName: string;
  hospitalName?: string;
  specialization?: string;
  appointmentDate: string;
  duration?: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  reminderBefore?: number;
  address?: string;
  isOnline: boolean;
  meetingLink?: string;
}

// ==================== EMERGENCY ====================
export interface EmergencyContact {
  id: string;
  familyMemberId: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface EmergencyProfile {
  member: FamilyMember;
  medications: Medication[];
  emergencyContacts: EmergencyContact[];
  conditions: string[];
}

// ==================== AI CONTEXT ====================
export interface AIContext {
  member: {
    name: string;
    age: number;
    gender?: Gender;
    bloodGroup?: BloodGroup;
    allergies: string[];
    conditions: string[];
  };
  activeMedications: Medication[];
  recentVitals: {
    bp: BloodPressureLog[];
    sugar: SugarLog[];
    weight: WeightLog[];
  };
  medicationCompliance: {
    last7days: number;
    last30days: number;
  };
  weather?: {
    temp: number;
    humidity: number;
    uvIndex: number;
    aqi: number;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  timezone: string;
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ==================== HABITS ====================
export interface Habit {
  id: string;
  familyMemberId: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  notes?: string;
}

// ==================== CALENDAR ====================
export type CalendarEventType = 'APPOINTMENT' | 'MEDICATION_REFILL' | 'LAB_TEST' | 'VACCINATION' | 'CHECKUP' | 'CUSTOM';

export interface CalendarEvent {
  id: string;
  familyMemberId: string;
  title: string;
  type: CalendarEventType;
  startDate: string;
  endDate?: string;
  color: string;
  description?: string;
  isAllDay: boolean;
}

// ==================== DASHBOARD ====================
export interface DashboardData {
  greeting: string;
  healthScore: number;
  todayMedications: MedicationWithSchedule[];
  upcomingAppointments: Appointment[];
  recentVitals: {
    bp?: BloodPressureLog;
    sugar?: SugarLog;
    weight?: WeightLog;
  };
  weatherCard?: WeatherHealthCard;
  aiInsight?: string;
  streaks: {
    medication: number;
    hydration: number;
    exercise: number;
  };
}

export interface MedicationWithSchedule extends Medication {
  schedules: MedicationSchedule[];
  todayLogs: MedicationLog[];
}

export interface WeatherHealthCard {
  temperature: number;
  condition: string;
  uvIndex: number;
  humidity: number;
  recommendations: string[];
}

// ==================== API ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
