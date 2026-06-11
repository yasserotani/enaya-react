import axiosClient from "../../../api/axiosClient";

export async function fetchUsers(params = {}) {
  const { data } = await axiosClient.get("/admin/users", { params });
  return data.data;
}

export async function createUser(payload) {
  const { data } = await axiosClient.post("/admin/users", payload);
  return data;
}

export async function fetchUserById(userId) {
  const { data } = await axiosClient.get(`/admin/users/${userId}`);
  return data.data;
}

export async function updateUser(userId, payload) {
  const { data } = await axiosClient.put(`/admin/users/${userId}`, payload);
  return data;
}

export async function updatePatient(patientId, payload) {
  const { data } = await axiosClient.put(
    `/admin/patients/${patientId}`,
    payload,
  );
  return data;
}

export async function deleteUser(userId) {
  const { data } = await axiosClient.delete(`/admin/users/${userId}`);
  return data;
}
