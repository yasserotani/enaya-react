import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function RecentPatientsList({ patients = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Patients</h2>
          <p className="text-sm text-foreground/60">Latest registrations</p>
        </div>
        <Link
          to="/patients"
          className="text-sm font-medium text-primary transition hover:text-primary/80"
        >
          View all
        </Link>
      </div>

      {patients.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-foreground/50">
          No recent patients
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link
                to={`/patients/${patient.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-muted-light/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {patient.full_name}
                  </p>
                  <p className="truncate text-sm text-foreground/60">{patient.phone}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-foreground/50">
                    {patient.created_at
                      ? dayjs(patient.created_at).fromNow()
                      : "—"}
                  </p>
                  <p className="text-xs text-foreground/40">
                    {patient.created_at
                      ? dayjs(patient.created_at).format("MMM D, YYYY")
                      : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
