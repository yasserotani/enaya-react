import { useCallback, useEffect, useState } from "react";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-foreground/60 md:text-base">
            Welcome back, {getDisplayName(user)}. Here&apos;s what&apos;s happening at
            Enaya today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="self-start rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted-light sm:self-auto"
        >
          Refresh
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={PeopleOutlinedIcon}
          label="Total Patients"
          value={dashboard.total_patients}
          sublabel="Registered in the system"
          accent="#333"
        />
        <StatCard
          icon={LocalHospitalOutlinedIcon}
          label="Doctors"
          value={dashboard.total_doctors}
          sublabel="Active medical staff"
          accent="accent"
        />
        <StatCard
          icon={EventAvailableOutlinedIcon}
          label="Appointments Today"
          value={dashboard.appointments_today}
          sublabel={`${dashboard.completed_today ?? 0} completed`}
          accent="success"
        />
        <StatCard
          icon={CalendarMonthOutlinedIcon}
          label="This Week"
          value={dashboard.appointments_this_week}
          sublabel="Appointments scheduled"
          accent="info"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={SupportAgentOutlinedIcon}
          label="Receptionists"
          value={dashboard.total_receptionists}
          sublabel="Front desk staff"
          accent="secondary"
        />
        <StatCard
          icon={PendingActionsOutlinedIcon}
          label="Pending"
          value={dashboard.pending_appointments}
          sublabel="Awaiting action"
          accent="warning"
        />
        <StatCard
          icon={TaskAltOutlinedIcon}
          label="Completed Today"
          value={dashboard.completed_today}
          sublabel="Finished visits"
          accent="success"
        />
      </section>

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

      <section className="grid gap-6 lg:grid-cols-2">
        <RecentPatientsList patients={dashboard.recent_patients} />
        <RecentAppointmentsList appointments={dashboard.recent_appointments} />
      </section>
    </div>
  );
}
