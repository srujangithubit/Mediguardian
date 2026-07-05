"use client";

import { SmartGreeting } from "../../components/dashboard/smart-greeting";
import { VitalsChart } from "../../components/monitoring/vitals-chart";
import { CoachBriefing } from "../../components/monitoring/coach-briefing";
import { HealthCalendar } from "../../components/monitoring/health-calendar";
import { AiFoodCards } from "../../components/monitoring/ai-food-cards";
import { GroceryList } from "../../components/monitoring/grocery-list";
import { VoiceButton } from "../../components/monitoring/voice-button";
import { DigitalTwinCard } from "../../components/ai/digital-twin-card";
import { TodayTimelineCard } from "../../components/medications/today-timeline-card";

import { TimelineReplay } from "../../components/analytics/timeline-replay";
import { RiskDashboard } from "../../components/analytics/risk-dashboard";
import { WeeklyReport } from "../../components/analytics/weekly-report";
import { AchievementBadges } from "../../components/analytics/achievement-badges";
import { CaregiverDashboard } from "../../components/caregiver/caregiver-dashboard";
import { DoctorShareLink } from "../../components/caregiver/doctor-share-link";
import { HealthJournal } from "../../components/journal/health-journal";

import { EmergencyQRCode } from "../../components/emergency/emergency-qr-code";
import { WearablesSettings } from "../../components/wearables/wearables-settings";
import { PrivacySettings } from "../../components/settings/privacy-settings";

import { useAuth } from "../../lib/auth-context";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SmartGreeting />
      </div>

      {/* Emergency Card - Top Level Priority */}
      <EmergencyQRCode />

      <CoachBriefing />

      {/* Analytics & Prediction */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[450px]">
          <RiskDashboard />
        </div>
        <div className="h-[450px]">
          <DigitalTwinCard />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-[450px]">
          <TimelineReplay />
        </div>
        <div className="h-[450px]">
          <WeeklyReport />
        </div>
      </div>

      {/* Gamification & Journal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-[350px]">
          <AchievementBadges />
        </div>
        <div className="h-[350px]">
          <HealthJournal />
        </div>
      </div>

      {/* Family & Sharing */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CaregiverDashboard />
        </div>
        <div>
          <DoctorShareLink />
        </div>
      </div>

      {/* Monitoring */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[400px]">
          <VitalsChart />
        </div>
        <div className="h-[400px]">
          <TodayTimelineCard />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="h-[450px]">
          <HealthCalendar />
        </div>
        <div className="h-[450px]">
          <GroceryList />
        </div>
        <div className="h-[450px]">
          <AiFoodCards />
        </div>
      </div>

      {/* Settings & Integrations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <WearablesSettings />
        </div>
        <div className="h-[400px]">
          <PrivacySettings />
        </div>
      </div>
      
      <VoiceButton />
    </div>
  );
}
