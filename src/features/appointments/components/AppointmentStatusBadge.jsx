import {
  STATUS_BADGE_STYLES,
  formatStatusLabel,
  normalizeStatus,
} from "../utils/appointmentHelpers";

export default function AppointmentStatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const style =
    STATUS_BADGE_STYLES[normalized] ?? "bg-muted-light text-foreground/70";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
