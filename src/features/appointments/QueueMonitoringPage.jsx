import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { fetchDepartments, fetchDoctors } from "../doctors/api/doctorsApi";
import {
  fetchAllAppointments,
  fetchAppointmentStats,
} from "./api/appointmentsApi";
import AppointmentStatusBadge from "./components/AppointmentStatusBadge";
import CreateAppointmentModal from "./components/CreateAppointmentModal";
import DoctorQueueCard from "./components/DoctorQueueCard";
import {
  getTodayDateString,
  groupAppointmentsByDoctor,
  resolveQueueDoctor,
} from "./utils/queueHelpers";
import {
  buildAppointmentDateParams,
  getDoctorDepartmentId,
  getDoctorName,
  getPatientName,
  normalizeStatus,
} from "./utils/appointmentHelpers";

const REFRESH_INTERVAL_MS = 30_000;

export default function QueueMonitoringPage() {
  const today = getTodayDateString();
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState(null);

  const loadQueue = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);

      try {
        const dateParams = buildAppointmentDateParams(today, today);

        const [
          appointmentItems,
          doctorsResult,
          departmentsResult,
          statsResult,
        ] = await Promise.all([
          fetchAllAppointments({ ...dateParams, per_page: 100 }),
          fetchDoctors({ per_page: 100 }),
          fetchDepartments(),
          fetchAppointmentStats(dateParams),
        ]);

        setAppointments(appointmentItems);
        setDoctors(doctorsResult.data ?? []);
        setDepartments(
          Array.isArray(departmentsResult)
            ? departmentsResult
            : (departmentsResult?.data ?? []),
        );
        setStats(statsResult);
        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load queue data",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [today],
  );

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadQueue(true);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadQueue]);

  // Handle returning from patient creation page
  useEffect(() => {
    if (location.state?.newlyCreatedPatient) {
      setNewlyCreatedPatient(location.state.newlyCreatedPatient);
      setShowCreateModal(true);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const allQueues = useMemo(
    () => groupAppointmentsByDoctor(appointments, doctors),
    [appointments, doctors],
  );

  const displayQueues = useMemo(() => {
    if (!departmentFilter) return allQueues;

    return allQueues.filter((queue) => {
      const doctor = resolveQueueDoctor(queue, doctors) ?? queue.doctor;
      return String(getDoctorDepartmentId(doctor)) === departmentFilter;
    });
  }, [allQueues, departmentFilter, doctors]);

  const completedToday = useMemo(() => {
    const source = departmentFilter
      ? allQueues
          .filter((queue) => {
            const doctor = resolveQueueDoctor(queue, doctors) ?? queue.doctor;
            return String(getDoctorDepartmentId(doctor)) === departmentFilter;
          })
          .flatMap((queue) => queue.allToday)
      : appointments;

    return source
      .filter((appt) => {
        const status = normalizeStatus(appt.status);
        return ["completed", "canceled", "noShow"].includes(status);
      })
      .sort(
        (a, b) =>
          dayjs(b.scheduled_at).valueOf() - dayjs(a.scheduled_at).valueOf(),
      )
      .slice(0, 10);
  }, [allQueues, appointments, departmentFilter, doctors]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 py-4">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Live queue monitoring
            </h1>

          </div>

        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-6 border-r border-border pr-4">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                Appointments today
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats?.total ?? "—"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                Completed today
              </p>
              <p className="text-xl font-bold text-primary">
                {stats?.completed ?? "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary"
          >
            New appointment
          </button>

          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => void loadQueue(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground/80 transition hover:bg-muted-light/60 disabled:opacity-50"
          >
            <RefreshOutlinedIcon
              sx={{ fontSize: 18 }}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-foreground/40">
          Last updated {dayjs(lastUpdated).format("h:mm:ss A")} · auto-refreshes
          every 30s
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setDepartmentFilter("")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            !departmentFilter
              ? "bg-primary text-background"
              : "border border-border bg-surface text-foreground/70 hover:bg-muted-light/40"
          }`}
        >
          All departments
        </button>
        {departments.map((department) => (
          <button
            key={department.id}
            type="button"
            onClick={() => setDepartmentFilter(String(department.id))}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              departmentFilter === String(department.id)
                ? "bg-primary text-background"
                : "border border-border bg-surface text-foreground/70 hover:bg-muted-light/40"
            }`}
          >
            {department.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-foreground/50">
          Loading queue...
        </p>
      ) : displayQueues.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center text-sm text-foreground/50">
          <p>
            No appointments scheduled for today
            {departmentFilter ? " in this department" : ""}.
          </p>
          {departmentFilter ? (
            <button
              type="button"
              onClick={() => setDepartmentFilter("")}
              className="mt-3 text-sm font-medium text-primary hover:text-secondary"
            >
              Show all departments
            </button>
          ) : null}
          {appointments.length === 0 && stats?.total > 0 ? (
            <p className="mt-2 text-xs text-foreground/40">
              Stats show {stats.total} today, but the list came back empty. The
              backend date filter may not match today&apos;s local date.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {displayQueues.map((queue) => (
            <DoctorQueueCard key={queue.doctor.id} queue={queue} />
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Completed today
          </h2>
          <Link
            to="/appointments"
            className="text-sm font-medium text-primary transition hover:text-secondary"
          >
            View all appointments
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-light/50 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Scheduled time</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {completedToday.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-foreground/50"
                  >
                    No completed visits yet today
                  </td>
                </tr>
              ) : (
                completedToday.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-border/70 transition hover:bg-muted-light/30"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {getPatientName(appointment)}
                    </td>
                    <td className="px-6 py-3 text-foreground/70">
                      {getDoctorName(appointment)}
                    </td>
                    <td className="px-6 py-3 text-foreground/70">
                      {appointment.scheduled_at
                        ? dayjs(appointment.scheduled_at).format("h:mm A")
                        : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CreateAppointmentModal
        open={showCreateModal}
        doctors={doctors}
        newlyCreatedPatient={newlyCreatedPatient}
        onClose={() => {
          setShowCreateModal(false);
          setNewlyCreatedPatient(null);
        }}
        onCreated={() => {
          setShowCreateModal(false);
          setNewlyCreatedPatient(null);
          void loadQueue(true);
        }}
      />
    </div>
  );
}
