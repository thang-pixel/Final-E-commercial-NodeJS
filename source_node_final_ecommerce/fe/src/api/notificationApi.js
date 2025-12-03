import { api } from "./axios";
// params: page, limit, read_status, type
const getNotificationsByUserId = async (user_id, params) => {
  const resp = await api.get(`/api/notifications/user/${user_id}`, { params });
  return resp.data;
}

const markReadNotify = async (notification_id) => {
  const resp = await api.patch(`/api/notifications/${notification_id}/mark-read`);
  return resp.data;
}

export {
  getNotificationsByUserId,
  markReadNotify,
}