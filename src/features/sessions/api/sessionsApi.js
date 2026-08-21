import axiosClient from "../../../api/axiosClient";

export async function fetchSessionById(sessionId) {
  const { data } = await axiosClient.get(`/admin/sessions/${sessionId}`);
  return data.data;
}
