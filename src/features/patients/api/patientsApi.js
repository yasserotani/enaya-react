import axiosClient from "../../../api/axiosClient";

export async function fetchPatients(params = {}) {
  const { data } = await axiosClient.get("/admin/patients", { params });
  return data.data;
}

export async function fetchPatientByUserId(userId) {
  const { data } = await axiosClient.get(`/admin/users/${userId}`);
  return data.data;
}

export async function fetchPatientById(patientId) {
  const { data } = await axiosClient.get(`/admin/patients/${patientId}`);
  return data.data;
}

export async function createPatient(payload) {
  const { data } = await axiosClient.post("/admin/patients", payload);
  return data;
}

export async function updatePatient(patientId, payload) {
  const { data } = await axiosClient.put(`/admin/patients/${patientId}`, payload);
  return data;
}

export async function deletePatient(patientId) {
  const { data } = await axiosClient.delete(`/admin/patients/${patientId}`);
  return data;
}
