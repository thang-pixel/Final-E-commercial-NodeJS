import {  useEffect, useRef, useState } from 'react';
import { notification } from 'antd';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider, 
  IconButton,
  Paper,
  Rating,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import {
  createComment,
  deleteCommentById,
  loadComments,
} from '../../../api/commentApi';
import { socket } from '../../../sockets/socket';
import useAuth from '../../../hooks/authHook';
import { formatTimeAgo } from '../../../utils/calculatorTimeUtils';
import imageUtils from '../../../utils/imageUtils';
import {
  getRatingByUserAndProductApi,
  updateRatingApi,
} from '../../../api/ratingApi';
import AlertRating from './AlertRating';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/Comment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';

const CommentList = ({ productId, product }) => {
  const [notiApi, notiContexHolder] = notification.useNotification();
  const { user } = useAuth();

  // pagination
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  const [ratingSummary, setRatingSummary] = useState({
    average_rating: 0,
    review_count: 0,
  });
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [isSomeOneTyping, setIsSomeOneTyping] = useState(false);
  const [oldRating, setOldRating] = useState({ content: '', rating: 0 }); // content, rating
  const [newRating, setNewRating] = useState(0);
  const [isAlertRatingOpen, setIsAlertRatingOpen] = useState(false);

  const typingHideTimerRef = useRef(null);
  const typingEmitTimerRef = useRef(null);

  const TYPING_HIDE_DELAY = 2000; // ms
  const TYPING_EMIT_DELAY = 400; // ms

  // -----------------------
  // 1. Handle typing
  // -----------------------
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewContent(value);

    // thông báo cho server là đang nhập comment
    if (typingEmitTimerRef.current) clearTimeout(typingEmitTimerRef.current);
    typingEmitTimerRef.current = setTimeout(() => {
      socket.emit('comment:typing', { product_id: productId });
    }, TYPING_EMIT_DELAY);
  };

  // -----------------------
  // 2. Submit comment
  // -----------------------
  const handleSubmitComment = async () => {
    if (!newContent.trim()) {
      notiApi.warning({
        message: 'Nội dung bình luận không được để trống.',
        duration: 3,
      });
      return;
    }

    const payload = {
      content: newContent,
      // Giả sử BE dùng display_name, nếu BE dùng displayName thì đổi lại
      display_name: user ? user.full_name : displayName,
      parent_comment: null,
    };

    if (!user && !displayName.trim()) {
      notiApi.warning({
        message: 'Vui lòng nhập tên hiển thị cho bình luận.',
        duration: 3,
      });
      return;
    }

    try {
      if (user && newRating > 0) {
        await updateRatingApi(user._id, productId, {
          value: newRating,
          content: newContent, // không cần nội dung ở đây
        });
      }

      await createComment(productId, payload);
      setNewContent('');
      if (!user) setDisplayName('');
      notiApi.success({
        message: 'Gửi bình luận thành công!',
        duration: 3,
      });
      // Không cần setComments ở đây nếu BE emit comment:new bằng io.to(...)
    } catch (error) {
      console.error('Lỗi khi thêm bình luận:', error);
      notiApi.error({
        message: 'Gửi bình luận thất bại. Lỗi: ' + error.message,
        duration: 5,
      });
    }
  };

  // -----------------------
  // Phân trang
  // -----------------------
  const applyPage = (newPage) => {
    if (newPage === page) return;
    setPage(newPage);
    // Tải trang mới
  };

  // -----------------------
  // 3. Load comments lần đầu
  // -----------------------
  useEffect(() => {
    (async () => {
      setCommentLoading(true);
      try {
        const resp = await loadComments(productId, { page: page, limit: 5 });
        // tuỳ API của bạn, có thể là resp.data.data
        const { data, meta } = resp;
        setComments(data);
        // set meta nếu có phân trang từ BE
        console.log('Loaded comments meta:', meta);
        setMeta(meta || {});
      } catch (error) {
        console.error('Lỗi khi tải bình luận:', error);
      } finally {
        setCommentLoading(false);
      }
    })();
  }, [productId, page]);

  // -----------------------
  // 4. WebSocket join room + lắng nghe event
  // -----------------------
  useEffect(() => {
    // JOIN room cho product này
    socket.emit('product:join', productId);

    // new comment từ server
    const handleNewComment = (comment) => {
      console.log('New comment received via socket:', comment);

      // tuỳ BE gửi field gì, nên thống nhất là productId
      if (comment.product_id !== productId) return;

      // chi set với slice đúng limit
      setComments((prev) => [comment, ...prev].slice(0, 5)); // prepend hoặc append tuỳ bạn
    };

    // typing indicator
    const handleTypingEvent = (data) => {
      if (data.product_id !== productId) return;

      setIsSomeOneTyping(true);
      // tắt sau 2s nếu không có event mới
      if (typingHideTimerRef.current) clearTimeout(typingHideTimerRef.current);
      typingHideTimerRef.current = setTimeout(() => {
        setIsSomeOneTyping(false);
      }, TYPING_HIDE_DELAY);
    };

    const handleUpdatedRating = (data) => {
      // Cập nhật rating trung bình và số lượt đánh giá trên UI nếu cần
      if (data.product_id === productId && product) {
        const average_rating = data.new_average;
        const review_count = data.new_count;
        setRatingSummary({ average_rating, review_count });
      }
    };

    socket.on('comment:new', handleNewComment);
    socket.on('comment:typing', handleTypingEvent);
    socket.on('rating:updated', handleUpdatedRating);

    return () => {
      // Rời room + cleanup listener
      socket.emit('product:leave', productId);
      socket.off('comment:new', handleNewComment);
      socket.off('comment:typing', handleTypingEvent);
      socket.off('rating:updated', handleUpdatedRating);
      if (typingHideTimerRef.current) clearTimeout(typingHideTimerRef.current);
      if (typingEmitTimerRef.current) clearTimeout(typingEmitTimerRef.current);
    };
  }, [productId, product]);

  // -----------------------
  // 5. Load initial rating summary từ product prop nếu có
  // -----------------------
  useEffect(() => {
    if (product) {
      setRatingSummary({
        average_rating: product.average_rating,
        review_count: product.review_count,
      });
    }
  }, [product]);

  // -----------------------
  // 6. Load rating by user nếu đã login
  // -----------------------
  useEffect(() => {
    (async () => {
      if (user) {
        try {
          const resp = await getRatingByUserAndProductApi(user._id, productId);
          const { data: respData } = resp;
          console.log('Loaded user rating data:', respData);
          if (respData) {
            setNewRating(respData.rating || 0);
            setNewContent(respData.content || '');
            setOldRating({
              content: respData.content || '',
              rating: respData.rating || 0,
            });
          }
        } catch (error) {
          console.error('Lỗi khi tải đánh giá của user:', error);
        }
      }
    })();
  }, [user, productId]);

  // -----------------------
  // delete comment
  // -----------------------
  const handleDeleteComment = async (commentId) => {
    try {
      const resp = await deleteCommentById(commentId);
      notiApi.success({
        message: 'Xoá bình luận thành công!',
        duration: 3,
      });
      // Cập nhật lại danh sách bình luận nếu cần
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
      setPage(1);
    } catch (error) {
      notiApi.error({
        message: 'Xoá bình luận thất bại!',
        duration: 3,
      });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {notiContexHolder}
      <AlertRating
        isOpen={isAlertRatingOpen}
        setIsOpen={setIsAlertRatingOpen}
      />

      {/* Header với icon */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <CommentIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>
          Đánh giá & Bình luận
        </Typography>
      </Stack>

      {/* Rating Summary Card */}
      <Card
        sx={{
          mb: 3,
          bgcolor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.200',
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            flexWrap="wrap"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <StarIcon color="warning" />
              <Typography variant="body2">
                <b>{ratingSummary.average_rating?.toFixed(1) || 0}</b> / 5
              </Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon color="action" />
              <Typography variant="body2">
                <b>{ratingSummary.review_count || 0}</b> đánh giá
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Form gửi mới */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            Viết đánh giá của bạn
          </Typography>

          {/* Rating input */}
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <StarIcon color="warning" fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                Chấm điểm
              </Typography>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              flexWrap="wrap"
            >
              <Rating
                name="product-comment-rating"
                precision={0.5}
                size="large"
                value={newRating}
                onChange={(e, newValue) => {
                  if (!user) {
                    notiApi.warning({
                      message: 'Vui lòng đăng nhập để đánh giá sản phẩm.',
                    });
                    setIsAlertRatingOpen(true);
                    return;
                  }
                  setNewRating(newValue);
                }}
              />
              {!user && (
                <Chip
                  icon={<PersonIcon />}
                  label="Đăng nhập để chấm sao"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Stack>

            {user && oldRating.rating > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <EditIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Đánh giá trước: {oldRating.rating}⭐ - {oldRating.content}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Comment input */}
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CommentIcon color="action" fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                Nội dung
              </Typography>
            </Stack>
            <TextField
              multiline
              minRows={3}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
              value={newContent}
              onChange={handleTyping}
              variant="outlined"
              fullWidth
            />
          </Stack>

          {/* Display name */}
          {!user && (
            <TextField
              label="Tên hiển thị"
              size="small"
              fullWidth
              sx={{ maxWidth: 300 }}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <PersonIcon
                    fontSize="small"
                    sx={{ mr: 1, color: 'action.active' }}
                  />
                ),
              }}
            />
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleSubmitComment}
              startIcon={<SendIcon />}
            >
              Gửi {user && newRating > 0 ? 'đánh giá' : 'bình luận'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setNewContent('');
                setNewRating(0);
              }}
              startIcon={<DeleteOutlineIcon />}
            >
              Xoá
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Typing indicator */}
      {isSomeOneTyping && (
        <Alert severity="info" icon={<EditIcon />} sx={{ mb: 2 }}>
          Ai đó đang nhập bình luận...
        </Alert>
      )}

      {/* Danh sách bình luận */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Các đánh giá ({meta.totalItems ?? comments.length})
      </Typography>

      {commentLoading ? (
        <Stack spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Paper key={i} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Stack flex={1} spacing={1}>
                  <Skeleton width="30%" />
                  <Skeleton width="100%" />
                  <Skeleton width="70%" />
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : comments.length === 0 ? (
        <Alert severity="info" icon={<CommentIcon />}>
          Chưa có bình luận nào. Hãy là người đầu tiên đánh giá sản phẩm này!
        </Alert>
      ) : (
        <Stack spacing={2}>
          {comments.map((r) => (
            <Paper
              key={r._id}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Stack direction="row" spacing={2}>
                {/* Avatar */}
                <Box>
                  <img
                    src={
                      r.user_ref?.avatar ||
                      imageUtils.createAvatarByName(r.display_name || 'Ẩn danh')
                    }
                    alt="avatar"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: '2px solid #e0e0e0',
                    }}
                  />
                </Box>

                {/* Content */}
                <Stack flex={1} spacing={1}>
                  {/* Header */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    width="100%"
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={600} variant="body1">
                        {r.display_name || r.displayName || 'Ẩn danh'}
                      </Typography>
                      {r.rating > 0 && (
                        <Rating
                          value={Number(r.rating)}
                          size="small"
                          readOnly
                        />
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ ml: 'auto' }}
                    >
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(r.createdAt || Date.now())}
                      </Typography>
                    </Stack>

                    {/* delete only adm */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      {user && user.role === 'admin' && (
                        <Tooltip title="Xoá bình luận">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteComment(r._id)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {/* Comment text */}
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-line',
                      color: 'text.primary',
                      lineHeight: 1.6,
                    }}
                  >
                    {r.content}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          ))}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ pt: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  size="small"
                  onClick={() => applyPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <Typography variant="body2">
                  Trang <b>{page}</b> / {meta.totalPages || 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    applyPage(Math.min(meta.totalPages || 1, page + 1))
                  }
                  disabled={page >= (meta.totalPages || 1)}
                >
                  <NavigateNextIcon />
                </IconButton>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Tổng: <b>{meta.totalItems ?? comments.length}</b> bình luận
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default CommentList;
