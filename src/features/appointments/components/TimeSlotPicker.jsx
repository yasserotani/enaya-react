import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { fetchAvailableSlots } from "../api/appointmentsApi";
import { normalizeSlotTime, parseSlot } from "../utils/appointmentHelpers";

dayjs.extend(customParseFormat);

export default function TimeSlotPicker({
  doctorId,
  date,
  value,
  onChange,
  disabled = false,
}) {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const result = await fetchAvailableSlots({
          doctor_id: doctorId,
          date,
        });
        if (!cancelled) {
          setSlots(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setLoadError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Failed to load available slots",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadSlots();

    return () => {
      cancelled = true;
    };
  }, [doctorId, date]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const parsed = parseSlot(value);
    return parsed ? parsed.format("h:mm A") : value;
  }, [value]);

  const handleSelect = (slot) => {
    onChange(normalizeSlotTime(slot) || String(slot));
  };

  if (!doctorId || !date) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted-light/10 px-4 py-8 text-center">
        <AccessTimeOutlinedIcon
          className="mx-auto mb-2 text-foreground/30"
          sx={{ fontSize: 28 }}
        />
        <p className="text-sm text-foreground/50">
          Select a doctor and date to see available times
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-muted-light/10 px-4 py-8 text-center">
        <p className="text-sm text-foreground/50">Finding open slots...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
        {loadError}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted-light/10 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground/70">
          No open slots on this day
        </p>
        <p className="mt-1 text-xs text-foreground/50">
          Try another date or doctor
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
            Available slots
          </p>
          <p className="text-sm text-foreground/70">
            {slots.length} time{slots.length === 1 ? "" : "s"} open on{" "}
            {dayjs(date).format("MMM D")}
          </p>
        </div>
        {selectedLabel && (
          <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-background">
            {selectedLabel}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((slot) => {
          const parsed = parseSlot(slot);
          const slotValue = normalizeSlotTime(slot) || String(slot);
          const isSelected = normalizeSlotTime(value) === slotValue;
          const display = parsed ? parsed.format("h:mm A") : String(slot);

          return (
            <button
              key={String(slot)}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(slot)}
              className={`rounded-xl border px-3 py-3 text-center transition ${
                isSelected
                  ? "border-primary bg-primary text-background shadow-md"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
              } disabled:opacity-50`}
            >
              <span className="block text-sm font-semibold">{display}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
