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
  ShoppingCartCheckout,
} from '@mui/icons-material';
import { api } from '../../../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { getProductBySlug } from '../../../redux/reducers/productSlice';
import { message } from 'antd';
import { addToCart, addToCartUser } from '../../../redux/reducers/cartSlice';
import productUtil from '../../../utils/productUtil';
import Gallery from '../../../components/common/Gallery';
import stringUtils from '../../../utils/stringUtils';
import SkeletonProductDetail from '../../../components/common/SketonProductDetail';
import useAuth from '../../../hooks/authHook';

function ProductDetail() {
  const { slug } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  // store / redux
  const dispatch = useDispatch();
  const { currentProduct } = useSelector((state) => state.products);
  const { carts } = useSelector((state) => state.carts);
  const { user, isLoggedIn } = useAuth();

  // local state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // selections
  const [variants, setVariants] = useState([]);
  const [qty, setQty] = useState(1);
  const [attributes, setAttributes] = useState([]); // [{ code, values: [] }, ...]
  const [variantSelected, setVariantSelected] = useState(null);

  // reviews
  const [reviews, setReviews] = useState([]);
  const [rvLoading, setRvLoading] = useState(false);
  const [rvPage, setRvPage] = useState(1);
  const [rvTotalPages, setRvTotalPages] = useState(1);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');

  // load bang redux
  useEffect(() => {
    (async () => {
      setLoading(true);
      const rs = await dispatch(getProductBySlug(slug));

      const p = rs?.payload?.data || null;
      if (!p) {
        setErr('Không tìm thấy sản phẩm');
        setLoading(false);
        return;
      }

      setLoading(false);
      if (p) {
        setData(p);
        setVariants(p?.variants || []);
        setVariantSelected(p?.variants?.[0] || null);
        setAttributes(productUtil.getAttributesFromVariants(p?.variants || []));
      }
    })();
  }, [dispatch, slug]);

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
    return data.images.map((it) => stringUtils.normalizeUrl(it.img_url));
  }, [data]);

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

  if (loading) return <SkeletonProductDetail />;

  if (err)
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{err}</Alert>
      </Box>
    );

  if (!data) return null;

  const brandLabel = data.brand_id?.name || data.brand_id || '—';

  const handleAddToCart = async () => {
    const login = isLoggedIn && user;
    if (!variantSelected) {
      messageApi.open({
        type: 'warning',
        content: 'Vui lòng chọn thuộc tính sản phẩm.',
      });
      return;
    }

    // check stock
    // kiem tra so luong trong kho
    const cartItem = carts.find(
      (item) =>
        item.product_id === data._id &&
        item.variant_id === variantSelected._id
    );
    const existingQty = cartItem ? cartItem.quantity : 0;
    if (existingQty + qty > variantSelected.stock) {
      messageApi.open({
        type: 'warning',
        content: `Chỉ còn ${variantSelected.stock} sản phẩm trong kho.`,
      });
      return;
    }

    const payload = {
      product_id: data._id,
      variant_id: variantSelected ? variantSelected._id : null,
      SKU: variantSelected.SKU,
      attributes: variantSelected.attributes,
      quantity: qty,
      image_url: data.images[0].img_url,
      name: data.name,
      price: variantSelected.price,
    };
    console.log('Add to cart payload', payload);

    // check login
    if (login) {
      // Thực hiện thêm vào giỏ hàng
      dispatch(addToCartUser({ userId: user._id, body: payload }));

      messageApi.open({
        type: 'success',
        content: 'Đã thêm sản phẩm vào giỏ hàng.',
      });
    } else {
      dispatch(addToCart(payload));

      messageApi.open({
        type: 'success',
        content: 'Đã thêm sản phẩm vào giỏ hàng (chưa kết nối backend).',
      });
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {contextHolder}
      <Grid container spacing={3} display="flex" wrap="wrap">
        {/* Gallery */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Gallery images={images} name={data.name} />
          {/* Yêu cầu: ít nhất 3 ảnh */}
          {images.length < 3 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Sản phẩm nên có tối thiểu 3 hình minh hoạ để đạt đủ yêu cầu.
            </Alert>
          )}
        </Grid>

        {/* Info */}
        <Grid size={{ xs: 12, md: 6 }}>
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
                label={data.status === 'ACTIVE' ? 'Còn hàng' : 'Ngừng bán'}
                color={data.status === 'ACTIVE' ? 'success' : 'default'}
              />
            </Stack>

            <Typography variant="h6" color="error" fontWeight={800}>
              {variantSelected
                ? fmtVND(variantSelected.price)
                : currentProduct?.min_price + ' - ' + currentProduct?.max_price
                ? fmtVND(currentProduct?.max_price)
                : ''}
              {/* quantity */}
              {variantSelected ? ` - Còn lại: ${variantSelected.stock}` : ''}
            </Typography>
            {/* Quantity */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Số lượng:</Typography>
              <TextField
                type="number"
                size="small"
                sx={{ width: 100 }}
                inputProps={{ min: 1 }}
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (isNaN(v) || v < 1) {
                    setQty(1);
                  } else {
                    if (variantSelected && v > variantSelected.stock) {
                      messageApi.open({
                        type: 'warning',
                        content: `Chỉ còn ${variantSelected.stock} sản phẩm trong kho.`,
                      });
                      setQty(variantSelected.stock);
                      return;
                    } else {
                      setQty(v);
                    }
                  }
                }}
              />
            </Stack>

            {/* Danh sách thuộc tính */}
            <Grid container spacing={2}>
              {attributes.map((attr) => {
                const { code, values } = attr;

                return (
                  <Grid key={code} size={12}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {code.toUpperCase()}
                    </Typography>

                    <ToggleButtonGroup
                      color="primary"
                      value={
                        variantSelected?.attributes?.find(
                          (item) => item.code === code
                        )?.value || ''
                      }
                      exclusive
                      onChange={(_, val) => {
                        // ✅ Cho phép bỏ chọn - khi click vào button đang active
                        if (val === null) {
                          console.log('Deselected', code);
                          // Reset về variant đầu tiên hoặc xử lý logic khác
                          setVariantSelected(null);
                          return;
                        }

                        if (
                          val ===
                          variantSelected?.attributes?.find(
                            (item) => item.code === code
                          )?.value
                        ) {
                          return; // same value selected
                        }

                        console.log('select attr', code, val);
                        const variant = productUtil.findVariantByAttributes(
                          variants,
                          code,
                          val
                        );
                        console.log('found variant', variant);
                        if (variant) {
                          setVariantSelected(variant);
                        }
                      }}
                    >
                      {values.map((val) => (
                        <ToggleButton
                          key={val}
                          value={val}
                          // disabled={
                          //   !findVariantByAttributes(variants, code, val)
                          // }
                        >
                          {val}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                );
              })}
            </Grid>

            {/* action */}
            <div className="flex items-center justify-start gap-3 mt-4">
              <Button
                onClick={handleAddToCart}
                variant="contained"
                startIcon={<AddShoppingCart />}
              >
                Thêm vào giỏ
              </Button>
              <Button variant="outlined" startIcon={<ShoppingCartCheckout />}>
                Mua ngay
              </Button>
            </div>
          </Stack>
        </Grid>

        {/* description */}
        {/* Description: tối thiểu hiển thị 5 dòng (giữ xuống dòng) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Divider sx={{ my: 1 }} />
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

        {/* Thong so ky thuat */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Divider sx={{ my: 1 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Thông số kỹ thuật
            </Typography>
            {/* mang {key, value} */}
            {data.specifications ? (
              <>
                <Table size="small">
                  <TableBody>
                    {currentProduct.specifications.map((spec) => {
                      return (
                        <TableRow key={spec.key}>
                          <TableCell>{spec.key}</TableCell>
                          <TableCell>{spec.value}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                — Không có thông số kỹ thuật —
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Reviews */}
        <Grid size={12}>
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

/* ------------ Helpers ------------- */
function fmtVND(v) {
  if (v == null) return '—';
  try {
    return v.toLocaleString('vi-VN') + '₫';
  } catch {
    return `${v}₫`;
  }
}

export default ProductDetail;
