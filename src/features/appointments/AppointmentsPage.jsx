import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import DatePickerField from "../../components/ui/DatePickerField";
import StatCard from "../dashboard/components/StatCard";
import { fetchDoctors } from "../doctors/api/doctorsApi";
import {
  confirmAppointment,
  fetchAppointmentStats,
  fetchAppointments,
  markAppointmentArrived,
  markAppointmentNoShow,
} from "./api/appointmentsApi";
import AppointmentStatusBadge from "./components/AppointmentStatusBadge";
import AppointmentActionsMenu from "./components/AppointmentActionsMenu";
import CancelAppointmentModal from "./components/CancelAppointmentModal";
import CreateAppointmentModal from "./components/CreateAppointmentModal";
import EditAppointmentModal from "./components/EditAppointmentModal";
import RescheduleAppointmentModal from "./components/RescheduleAppointmentModal";
import { usePersistedListState } from "./hooks/usePersistedListState";
import {
  APPOINTMENT_STATUSES,
  buildAppointmentDateParams,
  getDoctorName,
  getPatientName,
} from "./utils/appointmentHelpers";

const STORAGE_KEY = "admin-appointments-list";

const selectInputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15 cursor-pointer";

function normalizeListResponse(result) {
  if (Array.isArray(result)) {
    return { items: result, meta: null };
  }

  if (result?.items) {
    return result;
  }

  return { items: [], meta: null };
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage ?? null,
  );

  const [listState, setListState] = usePersistedListState(STORAGE_KEY, {
    search: "",
    doctor_id: "",
    status: "",
    date_from: "",
    date_to: "",
    showFilters: false,
    currentPage: 1,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(
    listState.search.trim(),
  );

  const [appointments, setAppointments] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!location.state?.successMessage) return;

    setSuccessMessage(location.state.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!location.state?.openCreate) return;

    setShowCreateModal(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(listState.search.trim());
      setListState({ currentPage: 1 });
    }, 300);

    return () => clearTimeout(timer);
  }, [listState.search, setListState]);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctors() {
      try {
        const result = await fetchDoctors({ per_page: 100 });
        if (!cancelled) {
          setDoctors(result.data ?? []);
        }
      } catch {
        if (!cancelled) setDoctors([]);
      }
    }

    void loadDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  const buildQueryParams = useCallback(() => {
    const params = {
      page: listState.currentPage,
      doctor_id: listState.doctor_id,
      status: listState.status,
      ...buildAppointmentDateParams(
        listState.date_from,
        listState.date_to,
      ),
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    Object.keys(params).forEach((key) => {
      if (params[key] === "") delete params[key];
    });

    return params;
  }, [
    debouncedSearch,
    listState.date_from,
    listState.date_to,
    listState.doctor_id,
    listState.status,
    listState.currentPage,
  ]);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const result = await fetchAppointments(buildQueryParams());
      const { items, meta } = normalizeListResponse(result);
      setAppointments(items);
      setLastPage(meta?.last_page ?? 1);
    } catch (err) {
      setListError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load appointments",
      );
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryParams]);

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);

    try {
      const params = buildQueryParams();
      delete params.search;
      delete params.status;
      delete params.page;

      const result = await fetchAppointmentStats(params);
      setStats(result);
    } catch (err) {
      setStatsError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load appointment stats",
      );
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const updateListState = (patch) => {
    setListState((prev) => {
      const updated =
        typeof patch === "function" ? patch(prev) : { ...prev, ...patch };

      if (
        typeof patch !== "function" &&
        ("doctor_id" in patch ||
          "status" in patch ||
          "date_from" in patch ||
          "date_to" in patch)
      ) {
        updated.currentPage = 1;
      }

      return updated;
    });
  };

  const clearFilters = () => {
    setListState({
      search: "",
      doctor_id: "",
      status: "",
      date_from: "",
      date_to: "",
      showFilters: listState.showFilters,
      currentPage: 1,
    });
  };

  const hasActiveFilters =
    listState.doctor_id ||
    listState.status ||
    listState.date_from ||
    listState.date_to;

  const refreshAll = () => {
    void loadAppointments();
    void loadStats();
  };

  const runAction = async (appointmentId, action) => {
    setActionLoadingId(appointmentId);
    setActionError(null);

    try {
      await action();
      setSuccessMessage("Appointment updated successfully.");
      refreshAll();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update appointment",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const completionRate =
    stats?.completion_rate != null
      ? `${Math.round(stats.completion_rate * 100)}%`
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Manage clinic appointments and visit status
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-background transition hover:bg-secondary"
        >
          New appointment
        </button>
      </div>

      {statsError && (
        <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
          {statsError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarMonthOutlinedIcon}
          label="Total"
          value={isStatsLoading ? "…" : (stats?.total ?? 0)}
          accent="primary"
        />
        <StatCard
          icon={EventAvailableOutlinedIcon}
          label="Scheduled"
          value={isStatsLoading ? "…" : (stats?.scheduled ?? 0)}
          sublabel={
            stats?.confirmed != null
              ? `${stats.confirmed} confirmed`
              : undefined
          }
          accent="info"
        />
        <StatCard
          icon={CheckCircleOutlinedIcon}
          label="Completed"
          value={isStatsLoading ? "…" : (stats?.completed ?? 0)}
          sublabel={
            completionRate ? `${completionRate} completion rate` : undefined
          }
          accent="success"
        />
        <StatCard
          icon={CancelOutlinedIcon}
          label="Cancelled"
          value={isStatsLoading ? "…" : (stats?.cancelled ?? 0)}
          sublabel={
            stats?.no_show != null ? `${stats.no_show} no-shows` : undefined
          }
          accent="warning"
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-lg">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <input
            type="search"
            value={listState.search}
            onChange={(e) =>
              updateListState({ search: e.target.value })
            }
            placeholder="Search patient, reason, or notes..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
          />

          <select
            value={listState.doctor_id}
            onChange={(e) =>
              updateListState({ doctor_id: e.target.value })
            }
            className={`${selectInputClass} sm:max-w-[180px]`}
          >
            <option value="">All doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name}
              </option>
            ))}
          </select>

          <select
            value={listState.status}
            onChange={(e) => updateListState({ status: e.target.value })}
            className={`${selectInputClass} sm:max-w-[160px]`}
          >
            <option value="">All statuses</option>
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              updateListState({ showFilters: !listState.showFilters })
            }
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              listState.showFilters || hasActiveFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground/70 hover:bg-muted-light/60 hover:text-foreground"
            }`}
          >
            Dates {hasActiveFilters && "•"}
          </button>
        </div>

        {listState.showFilters && (
          <div className="flex flex-col gap-4 border-b border-border bg-muted-light/10 px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/60">
                  From
                </label>
                <DatePickerField
                  value={listState.date_from}
                  onChange={(val) => updateListState({ date_from: val })}
                  placeholder="Start date"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/60">
                  To
                </label>
                <DatePickerField
                  value={listState.date_to}
                  onChange={(val) => updateListState({ date_to: val })}
                  placeholder="End date"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground/70 transition hover:bg-muted-light/60 hover:text-foreground"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 rounded-xl border border-success-border bg-success-light px-4 py-3 text-sm text-success">
            {successMessage}
          </div>
        )}

        {(listError || actionError) && (
          <div className="mx-6 mt-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
            {listError || actionError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-light/50 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Date & time</th>
                <th className="px-6 py-3">Visit reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-foreground/50"
                  >
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-foreground/50"
                  >
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => {
                  const isRowLoading = actionLoadingId === appointment.id;

                  return (
                    <tr
                      key={appointment.id}
                      className="border-b border-border/70 transition hover:bg-muted-light/30"
                    >
                      <td
                        className="cursor-pointer px-6 py-4"
                        onClick={() =>
                          navigate(`/appointments/${appointment.id}`)
                        }
                      >
                        <p className="font-medium text-foreground">
                          {getPatientName(appointment)}
                        </p>
                        {appointment.patient?.phone && (
                          <p className="text-xs text-foreground/50">
                            {appointment.patient.phone}
                          </p>
                        )}
                      </td>
                      <td
                        className="cursor-pointer px-6 py-4 text-foreground/70"
                        onClick={() =>
                          navigate(`/appointments/${appointment.id}`)
                        }
                      >
                        {getDoctorName(appointment)}
                      </td>
                      <td
                        className="cursor-pointer px-6 py-4"
                        onClick={() =>
                          navigate(`/appointments/${appointment.id}`)
                        }
                      >
                        <p className="text-foreground">
                          {appointment.scheduled_at
                            ? dayjs(appointment.scheduled_at).format(
                                "MMM D, YYYY",
                              )
                            : "—"}
                        </p>
                        <p className="text-xs text-foreground/50">
                          {appointment.scheduled_at
                            ? dayjs(appointment.scheduled_at).format("h:mm A")
                            : ""}
                        </p>
                      </td>
                      <td
                        className="cursor-pointer px-6 py-4 text-foreground/70"
                        onClick={() =>
                          navigate(`/appointments/${appointment.id}`)
                        }
                      >
                        {appointment.visit_reason || "—"}
                      </td>
                      <td
                        className="cursor-pointer px-6 py-4"
                        onClick={() =>
                          navigate(`/appointments/${appointment.id}`)
                        }
                      >
                        <AppointmentStatusBadge status={appointment.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <AppointmentActionsMenu
                          appointment={appointment}
                          isLoading={isRowLoading}
                          onView={() =>
                            navigate(`/appointments/${appointment.id}`)
                          }
                          onEdit={() => setEditTarget(appointment)}
                          onConfirm={() =>
                            void runAction(appointment.id, () =>
                              confirmAppointment(appointment.id),
                            )
                          }
                          onMarkArrived={() =>
                            void runAction(appointment.id, () =>
                              markAppointmentArrived(appointment.id),
                            )
                          }
                          onReschedule={() => setRescheduleTarget(appointment)}
                          onMarkNoShow={() =>
                            void runAction(appointment.id, () =>
                              markAppointmentNoShow(appointment.id),
                            )
                          }
                          onCancel={() => setCancelTarget(appointment)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-foreground/60">
              Page {listState.currentPage} of {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={listState.currentPage <= 1 || isLoading}
                onClick={() =>
                  updateListState({ currentPage: listState.currentPage - 1 })
                }
                className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={listState.currentPage >= lastPage || isLoading}
                onClick={() =>
                  updateListState({ currentPage: listState.currentPage + 1 })
                }
                className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateAppointmentModal
        open={showCreateModal}
        doctors={doctors}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setSuccessMessage("Appointment booked successfully.");
          refreshAll();
        }}
      />

      <EditAppointmentModal
        open={Boolean(editTarget)}
        appointment={editTarget}
        doctors={doctors}
        onClose={() => setEditTarget(null)}
        onUpdated={() => {
          setEditTarget(null);
          setSuccessMessage("Appointment updated successfully.");
          refreshAll();
        }}
      />

      <CancelAppointmentModal
        open={Boolean(cancelTarget)}
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCanceled={() => {
          setSuccessMessage("Appointment cancelled successfully.");
          refreshAll();
        }}
      />

      <RescheduleAppointmentModal
        open={Boolean(rescheduleTarget)}
        appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onRescheduled={() => {
          setSuccessMessage("Appointment rescheduled successfully.");
          refreshAll();
        }}
      />
    </div>
  );
}
