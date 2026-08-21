import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const APPOINTMENT_STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "arrived", label: "Arrived" },
  { value: "inProgress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
  { value: "noShow", label: "No show" },
];

export function normalizeStatus(status) {
  if (!status) return "";

  const map = {
    in_progress: "inProgress",
    cancelled: "canceled",
    no_show: "noShow",
  };

  return map[status] ?? status;
}

export function formatStatusLabel(status) {
  const normalized = normalizeStatus(status);
  const match = APPOINTMENT_STATUSES.find((s) => s.value === normalized);
  if (match) return match.label;

  return normalized
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
}

export const STATUS_BADGE_STYLES = {
  scheduled: "bg-info-light text-info",
  confirmed: "bg-success-light text-success",
  arrived: "bg-warning-light text-warning",
  inProgress: "bg-primary/15 text-primary",
  completed: "bg-muted-light text-foreground/70",
  canceled: "bg-error-light text-error",
  noShow: "bg-error-light text-error",
};

export function canConfirm(status) {
  return normalizeStatus(status) === "scheduled";
}

export function canMarkArrived(status) {
  return normalizeStatus(status) === "confirmed";
}

export function canReschedule(status) {
  const normalized = normalizeStatus(status);
  return normalized === "scheduled" || normalized === "confirmed";
}

export function canCancel(status) {
  const normalized = normalizeStatus(status);
  return ["scheduled", "confirmed", "arrived"].includes(normalized);
}

export function canMarkNoShow(status) {
  const normalized = normalizeStatus(status);
  return normalized === "scheduled" || normalized === "confirmed";
}

export function canEdit(status) {
  const normalized = normalizeStatus(status);
  return normalized === "scheduled" || normalized === "confirmed";
}

export function getPatientName(appointment) {
  return (
    appointment?.patient?.full_name ?? `Patient #${appointment?.patient_id}`
  );
}

export function getDoctorName(appointment) {
  return (
    appointment?.doctor?.full_name ||
    appointment?.doctor?.user?.name ||
    appointment?.doctor?.specialty ||
    (appointment?.doctor_id ? `Doctor #${appointment.doctor_id}` : "—")
  );
}

export function buildScheduledAt(date, time) {
  if (!date || time == null || time === "") return "";

  const timePart = normalizeSlotTime(time) || String(time).trim();
  if (!timePart) return "";

  const parsed = dayjs(`${date} ${timePart}`, "YYYY-MM-DD HH:mm", true);

  if (parsed.isValid()) {
    return parsed.format("YYYY-MM-DD HH:mm:ss");
  }

  const withSeconds = dayjs(
    `${date} ${timePart}`,
    "YYYY-MM-DD HH:mm:ss",
    true,
  );

  if (withSeconds.isValid()) {
    return withSeconds.format("YYYY-MM-DD HH:mm:ss");
  }

  const loose = dayjs(`${date} ${timePart}`);
  return loose.isValid() ? loose.format("YYYY-MM-DD HH:mm:ss") : "";
}

export function normalizeSlotTime(time) {
  if (!time) return "";

  const parsed = parseSlot(time);
  return parsed ? parsed.format("HH:mm") : String(time);
}

export function parseSlot(slot) {
  if (slot == null || slot === "") return null;

  const raw = typeof slot === "string" ? slot.trim() : String(slot.time ?? slot);

  if (raw.includes("T") || raw.includes(" ")) {
    const dateTime = dayjs(raw);
    if (dateTime.isValid()) return dateTime;
  }

  const parsed = dayjs(
    raw,
    ["H:mm", "HH:mm", "H:mm:ss", "HH:mm:ss"],
    true,
  );

  return parsed.isValid() ? parsed : null;
}

export function getDoctorDepartmentId(doctor) {
  if (!doctor) return null;
  return doctor.department?.id ?? doctor.department_id ?? null;
}

export function buildAppointmentDateParams(dateFrom, dateTo) {
  const params = {};

  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  if (dateFrom && dateTo && dateFrom === dateTo) {
    params.date = dateFrom;
  } else if (dateFrom && !dateTo) {
    params.date = dateFrom;
  }

  return params;
}
