function duplicateEntryMessage(message, key, field, label) {
  if (!message.includes("Duplicate entry") || !message.includes(key)) {
    return null;
  }

  const match = message.match(/Duplicate entry '([^']+)'/);
  const value = match?.[1];

  if (value) {
    return {
      [field]: [`A user with this ${label} "${value}" already exists.`],
    };
  }

  return { [field]: [`This ${label} is already taken.`] };
}

export function parseApiErrors(err) {
  const data = err.response?.data;
  const errors = data?.errors;

  if (errors && typeof errors === "object" && Object.keys(errors).length > 0) {
    return errors;
  }

  const message = data?.message || data?.error;

  if (typeof message !== "string") {
    return { general: ["Something went wrong. Please try again."] };
  }

  if (message === "Unauthenticated.") {
    return { general: ["Your session has expired. Please log in again."] };
  }

  return (
    duplicateEntryMessage(message, "users_name_unique", "name", "name") ||
    duplicateEntryMessage(message, "users_email_unique", "email", "email") ||
    duplicateEntryMessage(
      message,
      "patients_full_name_unique",
      "full_name",
      "name",
    ) ||
    duplicateEntryMessage(
      message,
      "patients_phone_unique",
      "phone",
      "phone number",
    ) || { general: [message] }
  );
}
