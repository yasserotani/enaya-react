import { useEffect, useRef, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  canCancel,
  canConfirm,
  canEdit,
  canMarkArrived,
  canMarkNoShow,
  canReschedule,
} from "../utils/appointmentHelpers";

export default function AppointmentActionsMenu({
  appointment,
  isLoading = false,
  onView,
  onEdit,
  onConfirm,
  onMarkArrived,
  onReschedule,
  onMarkNoShow,
  onCancel,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const items = [
    { label: "View details", onClick: onView, show: true },
    { label: "Edit", onClick: onEdit, show: canEdit(appointment.status) },
    { label: "Confirm", onClick: onConfirm, show: canConfirm(appointment.status) },
    {
      label: "Mark arrived",
      onClick: onMarkArrived,
      show: canMarkArrived(appointment.status),
    },
    {
      label: "Reschedule",
      onClick: onReschedule,
      show: canReschedule(appointment.status),
    },
    {
      label: "Mark no-show",
      onClick: onMarkNoShow,
      show: canMarkNoShow(appointment.status),
      tone: "warning",
    },
    {
      label: "Cancel",
      onClick: onCancel,
      show: canCancel(appointment.status),
      tone: "error",
    },
  ].filter((item) => item.show);

  const run = (handler) => (event) => {
    event.stopPropagation();
    setOpen(false);
    handler?.();
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        disabled={isLoading}
        title="Actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 transition hover:bg-muted-light/60 hover:text-foreground disabled:opacity-50"
      >
        <MoreVertIcon sx={{ fontSize: 20 }} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[168px] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={run(item.onClick)}
              className={`block w-full px-4 py-2 text-left text-sm font-medium transition hover:bg-muted-light/50 ${
                item.tone === "error"
                  ? "text-error"
                  : item.tone === "warning"
                    ? "text-warning"
                    : "text-foreground/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
