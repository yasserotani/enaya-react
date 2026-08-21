import axiosClient from "../../../api/axiosClient";

export async function fetchDoctors(params = {}) {
  const { data } = await axiosClient.get("/admin/doctors", { params });
  return data.data;
}

export async function fetchDoctorById(doctorId) {
  const { data } = await axiosClient.get(`/admin/doctors/${doctorId}`);
  return data.data;
}

export async function createDoctor(payload) {
  const { data } = await axiosClient.post("/admin/doctors", payload);
  return data;
}

export async function updateDoctor(doctorId, payload) {
  const { data } = await axiosClient.put(`/admin/doctors/${doctorId}`, payload);
  return data;
}

export async function deleteDoctor(doctorId) {
  const { data } = await axiosClient.delete(`/admin/doctors/${doctorId}`);
  return data;
}

export async function restoreDoctor(doctorId) {
  const { data } = await axiosClient.put(`/admin/doctors/${doctorId}/restore`);
  return data;
}

export async function resetDoctorPassword(doctorId, payload) {
  const { data } = await axiosClient.patch(
    `/admin/doctors/${doctorId}/reset-password`,
    payload,
  );
  return data;
}

export async function fetchDepartments(params = {}) {
  const { data } = await axiosClient.get("/admin/departments", { params });
  return data.data;
}
