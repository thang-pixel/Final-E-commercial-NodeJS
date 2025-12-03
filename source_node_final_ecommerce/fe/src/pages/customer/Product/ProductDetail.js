// src/pages/customer/ProductDetail.jsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  Rating,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Alert,
  Stack,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { AddShoppingCart, ShoppingCartCheckout } from '@mui/icons-material';
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
import CommentList from '../../../components/common/product/CommentList';
import styleMuiUtils from '../../../utils/styleMuiUtils';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { isOutOfStock } from '../../../utils/productVariantUtil';

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

  const images = useMemo(() => {
    if (!data?.images) return [];
    return data.images.map((it) => stringUtils.normalizeUrl(it.img_url));
  }, [data]);

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
        item.product_id === data._id && item.variant_id === variantSelected._id
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

  // Mua ngay
  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!variantSelected) {
      messageApi.open({
        type: 'warning',
        content: 'Vui lòng chọn thuộc tính sản phẩm.',
      });
      return;
    }

    if (qty > variantSelected.stock) {
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
    }

    // Save selectedVariants to localStorage for checkout page
    localStorage.setItem(
      'checkout_items',
      JSON.stringify([payload])
    );
    // Navigate to checkout page
 
    window.location.href = '/checkout';
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 0 }, my: 2 }}>
      {contextHolder}
      <Grid
        container
        spacing={3}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
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
          <Stack spacing={1.25} sx={styleMuiUtils.createBoxRoundedShadow()}>
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
                label={
                  variantSelected && isOutOfStock(variantSelected) ? 'Hết hàng' : (data.status === 'ACTIVE' ? 'Còn hàng' : 'Ngừng bán')
                }
                color={
                  variantSelected && isOutOfStock(variantSelected) ? 'error' : (data.status === 'ACTIVE' ? 'success' : 'default')
                }
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
                disabled={
                  !variantSelected ||
                  variantSelected.stock === 0 ||
                  data.status !== PRODUCT_STATUS.ACTIVE.value
                }
              >
                Thêm vào giỏ
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outlined"
                startIcon={<ShoppingCartCheckout />}
                disabled={
                  !variantSelected ||
                  variantSelected.stock === 0 ||
                  data.status !== PRODUCT_STATUS.ACTIVE.value
                }
              >
                Mua ngay
              </Button>
            </div>
          </Stack>
        </Grid>

        {/* description */}
        {/* Description: tối thiểu hiển thị 5 dòng (giữ xuống dòng) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={styleMuiUtils.createBoxRoundedShadow()}>
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
          <Box sx={styleMuiUtils.createBoxRoundedShadow()}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Thông số kỹ thuật
            </Typography>
            {/* mang {key, value} */}
            {data.specifications ? (
              <>
                <Table size="small" bordered>
                  <TableBody>
                    {currentProduct.specifications.map((spec) => {
                      return (
                        <TableRow key={spec.key}>
                          <TableCell variant="head">{spec.key}</TableCell>
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

        {/* Reviews & Comments */}
        <Grid size={12} sx={styleMuiUtils.createBoxRoundedShadow()}>
          <CommentList productId={productId} product={data} />
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
