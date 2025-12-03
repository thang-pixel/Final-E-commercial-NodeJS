const { paginationParam } = require('../../utils/searchUtil');
const NotificationModel = require('../models/NotificationModel');

class NotificationController {
  // [GET] /notifications/user/:user_id
  async getNotificationsByUserId(req, res) {
    const { user_id } = req.params;
    const { type, is_read } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const filter = { user_id: Number(user_id) };
    if (type) filter.type = type;
    if (is_read !== undefined) filter.is_read = is_read === 'true'; 

    const { page, limit, skip } = paginationParam(req, 100);

    try {
       
      // đếm và lấy list
      // --- Pagination ---
      const [ data, total ] = await Promise.all([
        NotificationModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        NotificationModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        data: data,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          isLastPage: page >= totalPages,
        },
        message: 'Notifications retrieved successfully',
      });
    } catch (error) {
      return res.status(500).json({ errors: error, message: error.message });
    }
  }

  // [PATCH] /notifications/:notification_id/mark-read
  async markRead(req, res) {
    const { notification_id } = req.params;

    if (!notification_id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    try {
      const notification = await NotificationModel.findByIdAndUpdate(
        notification_id,
        { is_read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      return res.status(200).json({ notification });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new NotificationController();
