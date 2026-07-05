import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday, differenceInYears } from 'date-fns';

// ============================================
// Class Name Utility
// ============================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Date Formatters
// ============================================
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculateAge(dateOfBirth: string | Date): number {
  return differenceInYears(new Date(), new Date(dateOfBirth));
}

// ============================================
// Health Calculators
// ============================================
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-500' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500' };
  return { label: 'Obese', color: 'text-red-500' };
}

export function getBPCategory(systolic: number, diastolic: number): { label: string; color: string; severity: number } {
  if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-emerald-500', severity: 0 };
  if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: 'text-yellow-500', severity: 1 };
  if (systolic < 140 || diastolic < 90) return { label: 'High (Stage 1)', color: 'text-orange-500', severity: 2 };
  if (systolic >= 140 || diastolic >= 90) return { label: 'High (Stage 2)', color: 'text-red-500', severity: 3 };
  return { label: 'Crisis', color: 'text-red-700', severity: 4 };
}

export function getSugarCategory(level: number, type: 'fasting' | 'post-meal' | 'random'): { label: string; color: string } {
  if (type === 'fasting') {
    if (level < 70) return { label: 'Low', color: 'text-blue-500' };
    if (level < 100) return { label: 'Normal', color: 'text-emerald-500' };
    if (level < 126) return { label: 'Pre-diabetic', color: 'text-amber-500' };
    return { label: 'Diabetic', color: 'text-red-500' };
  }
  if (level < 140) return { label: 'Normal', color: 'text-emerald-500' };
  if (level < 200) return { label: 'Pre-diabetic', color: 'text-amber-500' };
  return { label: 'Diabetic', color: 'text-red-500' };
}

// ============================================
// Time of Day
// ============================================
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getGreeting(name: string, date: Date = new Date()): string {
  const timeOfDay = getTimeOfDay(date);
  const greetings: Record<TimeOfDay, string> = {
    morning: `Good Morning, ${name}`,
    afternoon: `Good Afternoon, ${name}`,
    evening: `Good Evening, ${name}`,
    night: `Good Night, ${name}`,
  };
  return greetings[timeOfDay];
}

export function getTimeIcon(date: Date = new Date()): string {
  const timeOfDay = getTimeOfDay(date);
  const icons: Record<TimeOfDay, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙',
  };
  return icons[timeOfDay];
}

// ============================================
// Medicine Helpers
// ============================================
export function calculateRefillDate(
  startDate: string | Date,
  totalQuantity: number,
  dailyDoses: number
): Date {
  const start = new Date(startDate);
  const daysSupply = Math.floor(totalQuantity / dailyDoses);
  const refillDate = new Date(start);
  refillDate.setDate(refillDate.getDate() + daysSupply);
  return refillDate;
}

export function getRemainingDays(remainingQty: number, dailyDoses: number): number {
  return Math.floor(remainingQty / dailyDoses);
}

export function getCompliancePercentage(taken: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((taken / total) * 100);
}

// ============================================
// Formatters
// ============================================
export function formatBP(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic}`;
}

export function formatWeight(kg: number): string {
  return `${kg} kg`;
}

export function formatSugar(level: number, unit: string = 'mg/dL'): string {
  return `${level} ${unit}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// Constants
// ============================================
export const MEDICATION_FREQUENCIES: Record<string, string> = {
  ONCE_DAILY: 'Once daily',
  TWICE_DAILY: 'Twice daily',
  THREE_TIMES_DAILY: 'Three times daily',
  FOUR_TIMES_DAILY: 'Four times daily',
  EVERY_OTHER_DAY: 'Every other day',
  WEEKLY: 'Weekly',
  AS_NEEDED: 'As needed',
  CUSTOM: 'Custom',
};

export const MEAL_RELATIONS: Record<string, string> = {
  BEFORE_MEAL: 'Before meal',
  AFTER_MEAL: 'After meal',
  WITH_MEAL: 'With meal',
  EMPTY_STOMACH: 'Empty stomach',
  NO_PREFERENCE: 'No preference',
};

export const BLOOD_GROUPS: Record<string, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
  UNKNOWN: 'Unknown',
};
