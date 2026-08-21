import { Link } from "react-router-dom";
import dayjs from "dayjs";
import AppointmentStatusBadge from "../../appointments/components/AppointmentStatusBadge";
import { getDoctorName } from "../../appointments/utils/appointmentHelpers";

export default function RecentAppointmentsList({ appointments = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent Appointments
          </h2>
          <p className="text-sm text-foreground/60">Upcoming and recent visits</p>
        </div>
        <Link
          to="/appointments"
          className="text-sm font-medium text-primary transition hover:text-primary/80"
        >
          View all
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-foreground/50">
          No recent appointments
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex items-start justify-between gap-4 px-5 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">
                    {appointment.patient?.full_name ?? `Patient #${appointment.patient_id}`}
                  </p>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>
                <p className="mt-0.5 text-sm text-foreground/60">
                  {getDoctorName(appointment)}
                  {appointment.visit_reason ? ` · ${appointment.visit_reason}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-foreground">
                  {appointment.scheduled_at
                    ? dayjs(appointment.scheduled_at).format("h:mm A")
                    : "—"}
                </p>
                <p className="text-xs text-foreground/50">
                  {appointment.scheduled_at
                    ? dayjs(appointment.scheduled_at).format("MMM D, YYYY")
                    : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
