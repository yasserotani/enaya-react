import dayjs from "dayjs";
import { normalizeStatus } from "./appointmentHelpers";

const QUEUE_UP_NEXT_STATUSES = new Set(["scheduled", "confirmed", "arrived"]);
const QUEUE_DONE_STATUSES = new Set(["completed", "canceled", "noShow"]);

export function getTodayDateString() {
  return dayjs().format("YYYY-MM-DD");
}

export function getWaitMinutes(scheduledAt) {
  if (!scheduledAt) return null;

  const scheduled = dayjs(scheduledAt);
  const diff = dayjs().diff(scheduled, "minute");

  return diff > 0 ? diff : 0;
}

export function formatWaitTime(minutes) {
  if (minutes == null) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getSessionElapsed(sessionOrAppointment) {
  const startedAt =
    sessionOrAppointment?.started_at ||
    sessionOrAppointment?.sessions?.find((s) => s.status === "active")
      ?.started_at;

  if (!startedAt) return null;

  const diff = dayjs().diff(dayjs(startedAt), "second");
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function groupAppointmentsByDoctor(appointments, doctors) {
  const byDoctor = new Map();

  const ensureDoctor = (doctorId, doctorData = null) => {
    const id = Number(doctorId);
    if (!id || byDoctor.has(id)) return byDoctor.get(id);

    const doctorFromList = doctors.find((doctor) => Number(doctor.id) === id);
    const entry = {
      doctor: doctorFromList ?? doctorData ?? { id },
      allToday: [],
      inSession: null,
      upNext: [],
      completedToday: [],
    };
    byDoctor.set(id, entry);
    return entry;
  };

  doctors.forEach((doctor) => {
    ensureDoctor(doctor.id, doctor);
  });

  appointments.forEach((appointment) => {
    const doctorId = Number(appointment.doctor?.id ?? appointment.doctor_id);
    if (!doctorId) return;

    const bucket = ensureDoctor(doctorId, appointment.doctor);
    bucket.allToday.push(appointment);

    const status = normalizeStatus(appointment.status);

    if (status === "inProgress") {
      bucket.inSession = appointment;
      return;
    }

    if (QUEUE_UP_NEXT_STATUSES.has(status)) {
      bucket.upNext.push(appointment);
      return;
    }

    if (QUEUE_DONE_STATUSES.has(status)) {
      bucket.completedToday.push(appointment);
    }
  });

  return Array.from(byDoctor.values())
    .filter((entry) => entry.allToday.length > 0)
    .map((entry) => ({
      ...entry,
      upNext: entry.upNext
        .filter((appt) => appt.id !== entry.inSession?.id)
        .sort(
          (a, b) =>
            dayjs(a.scheduled_at).valueOf() - dayjs(b.scheduled_at).valueOf(),
        ),
      completedToday: entry.completedToday.sort(
        (a, b) =>
          dayjs(b.scheduled_at).valueOf() - dayjs(a.scheduled_at).valueOf(),
      ),
    }));
}

export function getDoctorInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function resolveQueueDoctor(queue, doctors) {
  const doctorId = Number(queue?.doctor?.id ?? queue?.doctor_id);
  if (!doctorId) return queue?.doctor ?? null;

  return (
    doctors.find((doctor) => Number(doctor.id) === doctorId) ??
    queue?.doctor ??
    null
  );
}
