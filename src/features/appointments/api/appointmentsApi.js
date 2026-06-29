import axiosClient from "../../../api/axiosClient";

function parseListResponse(envelope) {
  if (!envelope) {
    return { items: [], meta: null };
  }

  if (Array.isArray(envelope)) {
    return { items: envelope, meta: null };
  }

  if (Array.isArray(envelope.items)) {
    return { items: envelope.items, meta: envelope.meta ?? null };
  }

  const payload = envelope.data;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: envelope.meta ?? null,
    };
  }

  if (payload && Array.isArray(payload.data)) {
    return {
      items: payload.data,
      meta:
        envelope.meta ?? {
          current_page: payload.current_page,
          last_page: payload.last_page,
          per_page: payload.per_page,
          total: payload.total,
        },
    };
  }

  return { items: [], meta: envelope.meta ?? null };
}

export async function fetchAppointments(params = {}) {
  const { data } = await axiosClient.get("/admin/appointments", { params });
  return parseListResponse(data);
}

export async function fetchAllAppointments(params = {}) {
  const firstPage = await fetchAppointments({ ...params, page: 1 });
  const items = [...firstPage.items];
  const lastPage = firstPage.meta?.last_page ?? 1;

  if (lastPage <= 1) {
    return items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      fetchAppointments({ ...params, page: index + 2 }),
    ),
  );

  remainingPages.forEach((page) => {
    items.push(...page.items);
  });

  return items;
}

export async function fetchAppointmentStats(params = {}) {
  const { data } = await axiosClient.get("/admin/appointments/stats", {
    params,
  });
  return data.data;
}

export async function fetchAppointmentById(appointmentId) {
  const { data } = await axiosClient.get(
    `/admin/appointments/${appointmentId}`,
  );
  return data.data;
}

export async function createAppointment(payload) {
  const { data } = await axiosClient.post("/admin/appointments", payload);
  return data;
}

export async function fetchAvailableSlots(params) {
  const { data } = await axiosClient.get("/admin/appointments/available-slots", {
    params,
  });
  return data.data ?? [];
}

export async function confirmAppointment(appointmentId) {
  const { data } = await axiosClient.patch(
    `/admin/appointments/${appointmentId}/confirm`,
  );
  return data;
}

export async function markAppointmentArrived(appointmentId) {
  const { data } = await axiosClient.patch(
    `/admin/appointments/${appointmentId}/arrived`,
  );
  return data;
}

export async function cancelAppointment(appointmentId, payload) {
  const { data } = await axiosClient.patch(
    `/admin/appointments/${appointmentId}/cancel`,
    payload,
  );
  return data;
}

export async function markAppointmentNoShow(appointmentId) {
  const { data } = await axiosClient.patch(
    `/admin/appointments/${appointmentId}/no-show`,
  );
  return data;
}

export async function rescheduleAppointment(appointmentId, payload) {
  const { data } = await axiosClient.patch(
    `/admin/appointments/${appointmentId}/reschedule`,
    payload,
  );
  return data;
}

export async function updateAppointment(appointmentId, payload) {
  const { data } = await axiosClient.put(
    `/admin/appointments/${appointmentId}`,
    payload,
  );
  return data;
}
