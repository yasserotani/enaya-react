import { useEffect, useState } from "react";
import dayjs from "dayjs";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import {
  formatWaitTime,
  getDoctorInitials,
  getSessionElapsed,
  getWaitMinutes,
} from "../utils/queueHelpers";
import { getPatientName } from "../utils/appointmentHelpers";

export default function DoctorQueueCard({ queue }) {
  const { doctor, allToday, inSession, upNext } = queue;
  const doctorName = doctor.full_name || doctor.user?.name || "Doctor";
  const departmentName = doctor.department?.name || doctor.specialty || "—";
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!inSession) return undefined;

    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [inSession]);

  const sessionElapsed = inSession ? getSessionElapsed(inSession) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {getDoctorInitials(doctorName)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {doctorName}
            </h3>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
              {departmentName}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-muted-light px-3 py-1 text-xs font-semibold text-foreground/70">
          {allToday.length} today
        </span>
      </div>

      {inSession ? (
        <div className="rounded-xl border border-border bg-muted-light/20 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              In session
            </span>
            <AppointmentStatusBadge status="inProgress" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className="text-lg font-semibold text-foreground">
              {getPatientName(inSession)}
            </p>
            {sessionElapsed && (
              <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
                {sessionElapsed}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted-light/10 px-4 py-8">
          <p className="text-sm italic text-foreground/50">
            No patient in session
          </p>
        </div>
      )}

      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Up next
        </span>
        {upNext.length === 0 ? (
          <p className="text-sm text-foreground/50">No patients waiting</p>
        ) : (
          <div className="space-y-2">
            {upNext.slice(0, 4).map((appointment) => {
              const waitMinutes = getWaitMinutes(appointment.scheduled_at);
              const waitLabel =
                appointment.status === "arrived" && waitMinutes != null
                  ? `Wait: ${formatWaitTime(waitMinutes)}`
                  : null;

              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-xl bg-muted-light/20 px-3 py-2.5"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {getPatientName(appointment)}
                    </p>
                    {waitLabel && (
                      <p className="text-xs font-medium text-primary">
                        {waitLabel}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">
                      {appointment.scheduled_at
                        ? dayjs(appointment.scheduled_at).format("h:mm A")
                        : "—"}
                    </p>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
