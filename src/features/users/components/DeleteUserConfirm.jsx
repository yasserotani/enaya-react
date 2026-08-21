  export default function DeleteUserConfirm({
  open,
  user,
  isDeleting,
  error,
  onClose,
  onConfirm,
}) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-background/40 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">Delete user</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{user.name}</span>?
          This action cannot be undone.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
