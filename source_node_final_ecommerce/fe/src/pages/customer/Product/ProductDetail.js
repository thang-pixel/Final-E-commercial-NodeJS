// src/pages/customer/ProductDetail.jsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  Divider,
  Rating,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Skeleton,
  Alert,
  Stack,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  AddShoppingCart,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { api } from '../../../api/axios';
import { API_DOMAIN } from '../../../constants/apiDomain';

export default function ProductDetail() {
  const { slug } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // selections
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [qty, setQty] = useState(1);

  // reviews
  const [reviews, setReviews] = useState([]);
  const [rvLoading, setRvLoading] = useState(false);
  const [rvPage, setRvPage] = useState(1);
  const [rvTotalPages, setRvTotalPages] = useState(1);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await api.get(`/api/products/${encodeURIComponent(slug)}`);
        if (!mounted) return;
        const prod = res.data?.data || res.data;
        setData(prod);
        // preselect defaults
        const c0 = prod?.variants?.[0]?.color || '';
        const s0 = prod?.variants?.[0]?.storage || '';
        setColor(c0);
        setStorage(s0);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Không tải được sản phẩm');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const productId = data?._id;

  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!productId) return;
      setRvLoading(true);
      try {
        const res = await api.get('/api/reviews', {
          params: { product_id: productId, page, limit: 5 },
        });
        const list = res.data?.data || [];
        const meta = res.data?.meta || { totalPages: 1 };
        setReviews(list);
        setRvTotalPages(meta.totalPages || 1);
      } catch {
        setReviews([]);
        setRvTotalPages(1);
      } finally {
        setRvLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    fetchReviews(rvPage);
  }, [fetchReviews, rvPage]);

  const images = useMemo(() => {
    if (!data?.images) return [];
    return data.images.map((it) => normalizeUrl(it.img_url));
  }, [data]);

  const colors = useMemo(() => {
    const set = new Set(
      (data?.variants || []).map((v) => v.color).filter(Boolean)
    );
    return [...set];
  }, [data]);

  const storages = useMemo(() => {
    const set = new Set(
      (data?.variants || [])
        .filter((v) => !color || v.color === color)
        .map((v) => v.storage)
        .filter(Boolean)
    );
    return [...set];
  }, [data, color]);

  const selectedVariant = useMemo(() => {
    if (!data?.variants) return null;
    return (
      data.variants.find(
        (v) =>
          (!color || v.color === color) && (!storage || v.storage === storage)
      ) || null
    );
  }, [data, color, storage]);

  const priceText = useMemo(() => {
    if (selectedVariant) return fmtVND(selectedVariant.price);
    if (data?.min_price != null && data?.max_price != null) {
      if (data.min_price === data.max_price) return fmtVND(data.min_price);
      return `${fmtVND(data.min_price)} - ${fmtVND(data.max_price)}`;
    }
    return '—';
  }, [selectedVariant, data]);

  const handleAddToCart = () => {
    if (!selectedVariant) return alert('Vui lòng chọn biến thể hợp lệ.');
    if ((selectedVariant.stock_quantity ?? 0) <= 0)
      return alert('Biến thể đã hết hàng.');
    // TODO: dispatch(addToCart({ productId: data._id, variantId: selectedVariant.id, qty }))
    alert('Đã thêm vào giỏ!');
  };

  const handleSubmitReview = async () => {
    if (!productId) return;
    if (!myRating || !myComment.trim()) {
      alert('Vui lòng chọn sao và nhập bình luận.');
      return;
    }
    try {
      await api.post('/api/reviews', {
        product_id: productId,
        rating: myRating,
        comment: myComment.trim(),
      });
      setMyRating(0);
      setMyComment('');
      fetchReviews(1);
      setRvPage(1);
    } catch (e) {
      alert(e?.response?.data?.message || 'Gửi đánh giá thất bại');
    }
  };

  if (loading) return <DetailSkeleton />;
  if (err)
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{err}</Alert>
      </Box>
    );
  if (!data) return null;

  const brandLabel =
    data.brand?.name || data.brand_name || data.brand_id || '—';

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <Grid container spacing={3} display="flex" wrap="wrap">
        {/* Gallery */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Gallery images={images} name={data.name} />
          {/* Yêu cầu: ít nhất 3 ảnh */}
          {images.length < 3 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Sản phẩm nên có tối thiểu 3 hình minh hoạ để đạt đủ yêu cầu.
            </Alert>
          )}
        </Grid>

        {/* Info */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.25}>
            <Typography variant="h5" fontWeight={700}>
              {data.name}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="body2">Thương hiệu:</Typography>
              <Chip size="small" label={brandLabel} />
              <Rating
                value={Number(data.average_rating || 0)}
                precision={0.5}
                readOnly
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {data.review_count || 0} đánh giá
              </Typography>
              <Chip
                size="small"
                label={data.status === 'ACTIVE' ? 'Còn hàng' : 'Tạm hết'}
                color={data.status === 'ACTIVE' ? 'success' : 'default'}
              />
            </Stack>

            <Typography variant="h6" color="error" fontWeight={800}>
              {priceText}
            </Typography>

            {/* Variants quick table (độc lập tồn kho) */}
            {!!data?.variants?.length && (
              <Box sx={{
                maxWidth: "100%",
                overflowX: "auto",
              }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Biến thể (mỗi biến thể theo dõi tồn kho riêng)
                </Typography>
                <Table
                  size="small"
                  sx={{
                    '& td, & th': { whiteSpace: 'nowrap', overflowX: 'auto' },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Chọn</TableCell>
                      <TableCell>Màu</TableCell>
                      <TableCell>ROM</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Giá</TableCell>
                      <TableCell>Tồn</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.variants.map((v) => {
                      const active = v.color === color && v.storage === storage;
                      return (
                        <TableRow key={v.id ?? `${v.color}-${v.storage}`}>
                          <TableCell>
                            <Button
                              size="small"
                              variant={active ? 'contained' : 'outlined'}
                              onClick={() => {
                                setColor(v.color || '');
                                setStorage(v.storage || '');
                              }}
                            >
                              Chọn
                            </Button>
                          </TableCell>
                          <TableCell>{v.color || '—'}</TableCell>
                          <TableCell>{v.storage || '—'}</TableCell>
                          <TableCell>{v.SKU || '—'}</TableCell>
                          <TableCell>{fmtVND(v.price)}</TableCell>
                          <TableCell>{v.stock_quantity ?? 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}

            {/* Color */}
            {!!colors.length && (
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Màu sắc
                </Typography>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  value={color}
                  onChange={(_, v) => v && setColor(v)}
                >
                  {colors.map((c) => (
                    <ToggleButton key={c} value={c} size="small">
                      {c}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            )}

            {/* Storage */}
            {!!storages.length && (
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Dung lượng
                </Typography>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  value={storage}
                  onChange={(_, v) => v && setStorage(v)}
                >
                  {storages.map((s) => (
                    <ToggleButton key={s} value={s} size="small">
                      {s}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            )}

            {/* Qty + Add */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                label="Số lượng"
                type="number"
                size="small"
                inputProps={{
                  min: 1,
                  max: selectedVariant?.stock_quantity ?? 99,
                }}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value || 1)))
                }
                sx={{ width: 120 }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCart />}
                disabled={
                  !selectedVariant ||
                  (selectedVariant?.stock_quantity ?? 0) <= 0
                }
                onClick={handleAddToCart}
              >
                Thêm vào giỏ
              </Button>
            </Stack>

            <Divider sx={{ my: 1 }} />
          </Stack>
        </Grid>

        {/* description */}
        {/* Description: tối thiểu hiển thị 5 dòng (giữ xuống dòng) */}
        <Grid item size={12}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Mô tả
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
                minHeight: '5.6em', // ~ 5 dòng (5 * 1.12em tuỳ font)
              }}
            >
              {data.description || '—'}
            </Typography>
          </Box>
        </Grid>

        {/* Reviews */}
        <Grid item size={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Đánh giá & Bình luận
          </Typography>

          {/* Form gửi mới */}
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Đánh giá của bạn:</Typography>
              <Rating value={myRating} onChange={(_, v) => setMyRating(v)} />
            </Stack>
            <TextField
              multiline
              minRows={3}
              placeholder="Chia sẻ cảm nhận về sản phẩm…"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleSubmitReview}>
                Gửi đánh giá
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  setMyRating(0);
                  setMyComment('');
                }}
              >
                Xoá
              </Button>
            </Stack>
          </Stack>

          {/* Danh sách bình luận */}
          {rvLoading ? (
            <Stack spacing={1}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton width="30%" />
                  <Skeleton height={18} />
                  <Skeleton height={18} width="70%" />
                </Box>
              ))}
            </Stack>
          ) : reviews.length === 0 ? (
            <Alert severity="info">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </Alert>
          ) : (
            <Stack spacing={2}>
              {reviews.map((r) => (
                <Box
                  key={r._id ?? r.id}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={600}>
                        {r.user?.name || 'Ẩn danh'}
                      </Typography>
                      <Rating
                        value={Number(r.rating || 0)}
                        size="small"
                        readOnly
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(r.createdAt || Date.now()).toLocaleString(
                        'vi-VN'
                      )}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, whiteSpace: 'pre-line' }}
                  >
                    {r.comment}
                  </Typography>
                </Box>
              ))}
              {/* Phân trang review đơn giản */}
              {rvTotalPages > 1 && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ mt: 1 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setRvPage((p) => Math.max(1, p - 1))}
                    disabled={rvPage <= 1}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <Typography variant="body2">
                    Trang {rvPage}/{rvTotalPages}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setRvPage((p) => Math.min(rvTotalPages, p + 1))
                    }
                    disabled={rvPage >= rvTotalPages}
                  >
                    <ChevronRight />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

/* ------------ Gallery component ------------- */
function Gallery({ images = [], name = '' }) {
  const [active, setActive] = useState(0);
  if (!images.length)
    return (
      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 2 }}
      />
    );

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Khung ảnh cố định (vuông), ảnh contain nên không méo/nhảy layout */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          aspectRatio: '1 / 1', // cố định vuông
        }}
      >
        <img
          src={images[active]}
          alt={`${name}-${active}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />

        {/* Nút điều hướng */}
        <IconButton
          onClick={prev}
          size="small"
          sx={{
            position: 'absolute',
            top: '50%',
            left: 8,
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(0,0,0,.45)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,.6)' },
          }}
          aria-label="Previous image"
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={next}
          size="small"
          sx={{
            position: 'absolute',
            top: '50%',
            right: 8,
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(0,0,0,.45)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,.6)' },
          }}
          aria-label="Next image"
        >
          <ChevronRight />
        </IconButton>

        {/* Chỉ số ảnh */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'rgba(0,0,0,.45)',
            color: '#fff',
            fontSize: 12,
          }}
        >
          {active + 1}/{images.length}
        </Box>
      </Box>

      {/* Thumbnails */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mt: 1 }}>
        {images.map((src, i) => (
          <Box
            key={i}
            onClick={() => setActive(i)}
            sx={{
              borderRadius: 1,
              border: i === active ? '2px solid' : '1px solid',
              borderColor: i === active ? 'primary.main' : 'divider',
              width: 72,
              height: 72,
              flex: '0 0 auto',
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              bgcolor: 'background.paper',
            }}
            title={`Ảnh ${i + 1}`}
          >
            <img
              src={src}
              alt={`${name}-thumb-${i}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ------------ Helpers ------------- */
function fmtVND(v) {
  if (v == null) return '—';
  try {
    return v.toLocaleString('vi-VN') + '₫';
  } catch {
    return `${v}₫`;
  }
}

function normalizeUrl(path = '') {
  const base = (API_DOMAIN || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${base}/${p}`;
}

function DetailSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={72}
                height={72}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton width="60%" height={36} />
          <Skeleton width="40%" height={24} />
          <Skeleton width="30%" height={32} />
          <Skeleton width="100%" height={140} />
          <Skeleton width="70%" height={28} />
        </Grid>
      </Grid>
    </Box>
  );
}
