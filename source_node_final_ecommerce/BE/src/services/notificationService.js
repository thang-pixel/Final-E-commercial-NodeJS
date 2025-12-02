const NotificationModel = require('../app/models/NotificationModel');

let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
}

const sentNotificationToAdmin =  async({ user_id, type, title, message, link}) => {
  const notiData = await NotificationModel.create({
    user_id,
    type,
    title,
    message,
    link,
  });

  if (ioInstance) {
    ioInstance.to('admins_room').emit('admin_notification:new', notiData);
  }

}

module.exports = {
  setIO,
  sentNotificationToAdmin,
};