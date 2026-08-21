export default function DeleteDepartmentConfirm({ open, department, isDeleting, error, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-xl">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Delete Department</h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-foreground/80">
            Are you sure you want to delete the department{" "}
            <span className="font-semibold text-foreground">"{department?.name}"</span>?
          </p>
          <p className="mt-2 text-xs text-foreground/60">
            This action cannot be undone. Note that you cannot delete a department that has active doctors assigned to it.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-error/80 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete department"}
          </button>
        </div>
      </div>
    </div>
  );
}
