import { ADMIN_NOTIFICATIONS } from "../constants/notifyContants";

const createLinkNotification = (notifyType, data) => {
  if (notifyType == ADMIN_NOTIFICATIONS.ORDER_NEW || notifyType == ADMIN_NOTIFICATIONS.ORDER_STATUS_CHANGED) {
    return '/admin/orders/' + data._id;
  }

  if (notifyType == ADMIN_NOTIFICATIONS.USER_REGISTERED) {
    return '/admin/users/' + data._id;
  }

  if (notifyType == ADMIN_NOTIFICATIONS.PRODUCT_REVIEWED) {
    return '/admin/products/' + data._id + '/detail';
  }

  return '/admin/notifications';
}
 
module.exports = {
  createLinkNotification,
};