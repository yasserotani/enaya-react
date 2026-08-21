import { useEffect, useState } from "react";

function readStoredState(storageKey, defaults) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function usePersistedListState(storageKey, defaults) {
  const [state, setState] = useState(() =>
    readStoredState(storageKey, defaults),
  );

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, state]);

  const updateState = (patch) => {
    setState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch),
    }));
  };

  return [state, updateState];
}
