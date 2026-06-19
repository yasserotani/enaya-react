import { useCallback, useEffect, useState } from "react";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EventNoteIcon from "@mui/icons-material/EventNote";

import { useAuth } from "../auth/useAuth";
import { useThemeStore } from "../../store/useThemeStore";
import { fetchDashboard } from "./api/dashboardApi";
import StatCard from "./components/StatCard";
import AppointmentsTrendChart from "./components/AppointmentsTrendChart";
import StaffDistributionChart from "./components/StaffDistributionChart";
import AppointmentStatusChart from "./components/AppointmentStatusChart";
import RecentPatientsList from "./components/RecentPatientsList";
import RecentAppointmentsList from "./components/RecentAppointmentsList";
import DashboardSkeleton from "./components/DashboardSkeleton";

function getDisplayName(user) {
  return user?.username || user?.name || user?.email || "Admin";
}

export default function DashboardPage() {
  const { fetchUser, user } = useAuth();
  const isDark = useThemeStore((state) => state.isDark);

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load dashboard data",
      );
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-error-border bg-error-light p-6 text-center">
          <p className="font-medium text-error">{error}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Welcome back, {getDisplayName(user)}. Here&apos;s what&apos;s
            happening at Enaya today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted-light"
        >
          Refresh
        </button>
      </div>

      {/* Today's Combined Operational Workflow Banner */}
      <div className="rounded-2xl border border-border bg-surface p-4 backdrop-blur-md">
        <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-foreground/40">
          Activity Status For Today
        </p>
        <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-4 py-2 sm:px-4 sm:py-1">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <EventNoteIcon fontSize="small" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Total Scheduled</p>
              <h3 className="text-lg font-bold text-foreground">
                {dashboard.appointments_today}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 py-3 sm:px-6 sm:py-1">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <AccessTimeIcon fontSize="small" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Awaiting Action</p>
              <h3 className="text-lg font-bold text-foreground">
                {dashboard.pending_appointments}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 sm:px-6 sm:py-1">
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircleOutlinedIcon fontSize="small" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Completed Visits</p>
              <h3 className="text-lg font-bold text-foreground">
                {dashboard.completed_today ?? 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Core Platform Registry Totals */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={PeopleOutlinedIcon}
          label="Total Patients"
          value={dashboard.total_patients}
          sublabel="Registered patients"
        />
        <StatCard
          icon={LocalHospitalOutlinedIcon}
          label="Doctors"
          value={dashboard.total_doctors}
          sublabel="Active medical staff"
        />
        <StatCard
          icon={SupportAgentOutlinedIcon}
          label="Receptionists"
          value={dashboard.total_receptionists}
          sublabel="Front desk team"
        />
        <StatCard
          icon={CalendarMonthOutlinedIcon}
          label="Scheduled This Week"
          value={dashboard.appointments_this_week}
          sublabel="Total weekly tracking"
        />
      </section>

      {/* Charts and Data Visualizations */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AppointmentsTrendChart
            data={dashboard.appointments_last_7_days}
            isDark={isDark}
          />
        </div>
        <StaffDistributionChart
          totalPatients={dashboard.total_patients}
          totalDoctors={dashboard.total_doctors}
          totalReceptionists={dashboard.total_receptionists}
          isDark={isDark}
        />
      </section>

      <section>
        <AppointmentStatusChart
          appointmentsToday={dashboard.appointments_today}
          completedToday={dashboard.completed_today}
          pendingAppointments={dashboard.pending_appointments}
          isDark={isDark}
        />
      </section>

      {/* Lists Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <RecentPatientsList patients={dashboard.recent_patients} />
        <RecentAppointmentsList appointments={dashboard.recent_appointments} />
      </section>
    </div>
  );
}
