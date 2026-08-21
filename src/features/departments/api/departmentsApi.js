import axiosClient from "../../../api/axiosClient";

export async function fetchDepartments(params = {}) {
  const { data } = await axiosClient.get("/admin/departments", { params });
  return data;
}

export async function fetchDepartmentById(departmentId) {
  const { data } = await axiosClient.get(`/admin/departments/${departmentId}`);
  return data.data;
}

export async function createDepartment(payload) {
  const { data } = await axiosClient.post("/admin/departments", payload);
  return data;
}

export async function updateDepartment(departmentId, payload) {
  const { data } = await axiosClient.put(`/admin/departments/${departmentId}`, payload);
  return data;
}

export async function deleteDepartment(departmentId) {
  const { data } = await axiosClient.delete(`/admin/departments/${departmentId}`);
  return data;
}


