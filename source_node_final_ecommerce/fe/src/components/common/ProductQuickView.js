import { AddShoppingCart, ShoppingCartCheckout } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToCartUser } from '../../redux/reducers/cartSlice';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Rating,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useState } from 'react';
import { useEffect } from 'react';
import Gallery from '../common/Gallery';
import { useMemo } from 'react';
import stringUtils from '../../utils/stringUtils';
import productUtil from '../../utils/productUtil';
import currencyUtils from '../../utils/currencyUtils';
import { message } from 'antd';
import { getProductBySlugApi } from '../../api/productApi';
import SkeletonProductDetail from './SketonProductDetail';
import useAuth from '../../hooks/authHook';

const ProductQuickView = ({ isOpen, setIsOpen, product }) => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  // cart from redux
  const { carts } = useSelector((state) => state.carts);
  // user from reducer
  const { user, isLoggedIn } = useAuth();

  // selections
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [qty, setQty] = useState(1);
  const [attributes, setAttributes] = useState([]); // [{ code, values: [] }, ...]
  const [variantSelected, setVariantSelected] = useState(null);

  const images = useMemo(() => {
    if (!product?.images) return [];
    return product.images.map((it) => stringUtils.normalizeUrl(it.img_url));
  }, [product]);

  useEffect(() => {
    (async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const resp = await getProductBySlugApi(product.slug);
        console.log('Variants details:', resp.data.variants);

        const productResp = resp.data;
        setVariants(productResp.variants || []);
        setAttributes(
          productUtil.getAttributesFromVariants(productResp.variants || [])
        );
        setVariantSelected(
          productResp.variants && productResp.variants.length > 0
            ? productResp.variants[0]
            : null
        );
      } catch (error) {
        console.error('Error fetching variant details:', error);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [product.slug, isOpen]);

  const handleAddToCart = async () => {
    const login = isLoggedIn && user;

    console.log('Add to cart clicked, login=', isLoggedIn, user);

    if (!variantSelected) {
      messageApi.open({
        type: 'warning',
        content: 'Vui lòng chọn thuộc tính sản phẩm.',
      });
      return;
    }

    const payload = {
      product_id: product._id,
      variant_id: variantSelected ? variantSelected._id : null,
      SKU: variantSelected.SKU,
      attributes: variantSelected.attributes,
      quantity: qty,
      image_url: product.images[0].img_url,
      name: product.name,
      price: variantSelected.price,
    };
    console.log('Add to cart payload', payload);

    // check stock
    // kiem tra so luong trong kho
    const cartItem = carts.find(
      (item) =>
        item.product_id === product._id &&
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

    // check login
    if (login) {
      // Thực hiện thêm vào giỏ hàng
      const res = await dispatch(addToCartUser({ userId: user._id, body: payload }));

      if (res.error) {
        messageApi.open({
          type: 'error',
          content: 'Lỗi khi thêm sản phẩm vào giỏ hàng.',
        });
      } else {
        messageApi.open({
          type: 'success',
          content: 'Đã thêm sản phẩm vào giỏ hàng.',
        });
      }
    } else {
      dispatch(addToCart(payload));
      messageApi.open({
        type: 'success',
        content: 'Đã thêm sản phẩm vào giỏ hàng.',
      });
    }
  };

  return (
    <>
      {/* Thêm/Sửa địa chỉ */}

      {contextHolder}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="md" // ✅ Set max width
        fullWidth
      >
        <DialogTitle>{product?.name}</DialogTitle>
        <DialogContent>
          {loading ? (
            <SkeletonProductDetail />
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Gallery images={images} name={product.name} />
              </Grid>

              {/* Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h5" fontWeight={700}>
                    {product.name}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography variant="body2">Thương hiệu:</Typography>
                    <Chip
                      size="small"
                      label={product.brand_id?.name || product.brand_id || '—'}
                    />
                    <Rating
                      value={Number(product.average_rating || 0)}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {product.review_count || 0} đánh giá
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        product.status === 'ACTIVE' ? 'Còn hàng' : 'Ngừng bán'
                      }
                      color={
                        product.status === 'ACTIVE' ? 'success' : 'default'
                      }
                    />
                  </Stack>

                  <Typography variant="h6" color="error" fontWeight={800}>
                    {variantSelected
                      ? currencyUtils.formatCurrency(variantSelected.price)
                      : product?.min_price + ' - ' + product?.max_price
                      ? currencyUtils.formatCurrency(product?.max_price)
                      : ''}
                    {/* quantity */}
                    {variantSelected
                      ? ` - Còn lại: ${variantSelected.stock}`
                      : ''}
                  </Typography>

                  {/* sô biên thể */}
                  <Typography variant="body2">
                    {variants.length} biến thể
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
                            // messageApi.open({
                            //   type: 'warning',
                            //   content: `Chỉ còn ${variantSelected.stock} sản phẩm trong kho.`,
                            // });
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
                              const variant =
                                productUtil.findVariantByAttributes(
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
                    <Button
                      variant="outlined"
                      startIcon={<ShoppingCartCheckout />}
                    >
                      Mua ngay
                    </Button>
                  </div>
                </Stack>
              </Grid>

              {/* description */}
              {/* Description: tối thiểu hiển thị 5 dòng (giữ xuống dòng) */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 1 }}
                  >
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
                    {product.description || '—'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );
};

export default ProductQuickView;
