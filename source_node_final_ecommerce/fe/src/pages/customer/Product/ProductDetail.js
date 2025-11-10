// src/pages/customer/ProductDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Grid, Typography, Chip, Button, Divider, Rating,
  ToggleButtonGroup, ToggleButton, TextField, Skeleton, Alert, Stack,
} from "@mui/material";
import { AddShoppingCart } from "@mui/icons-material";
import { api } from "../../../api/axios";                    // hoặc dùng Redux thunk getProductBySlug(slug)
import { API_DOMAIN } from "../../../constants/apiDomain";   // ví dụ: http://localhost:4000

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // selections
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get(`/api/products/${encodeURIComponent(slug)}`);
        if (!mounted) return;
        const prod = res.data?.data || res.data; // tuỳ backend
        setData(prod);
        // preselect defaults
        const c0 = prod?.variants?.[0]?.color || "";
        const s0 = prod?.variants?.[0]?.storage || "";
        setColor(c0);
        setStorage(s0);
      } catch (e) {
        setErr(e?.response?.data?.message || "Không tải được sản phẩm");
      } finally {
        mounted = false; setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  const images = useMemo(() => {
    if (!data?.images) return [];
    return data.images.map(it => normalizeUrl(it.img_url));
  }, [data]);

  const colors = useMemo(() => {
    const set = new Set((data?.variants || []).map(v => v.color).filter(Boolean));
    return [...set];
  }, [data]);

  const storages = useMemo(() => {
    const set = new Set(
      (data?.variants || [])
        .filter(v => !color || v.color === color)
        .map(v => v.storage)
        .filter(Boolean)
    );
    return [...set];
  }, [data, color]);

  const selectedVariant = useMemo(() => {
    if (!data?.variants) return null;
    return data.variants.find(v =>
      (!color || v.color === color) && (!storage || v.storage === storage)
    ) || null;
  }, [data, color, storage]);

  const priceText = useMemo(() => {
    if (selectedVariant) return fmtVND(selectedVariant.price);
    if (data?.min_price != null && data?.max_price != null) {
      if (data.min_price === data.max_price) return fmtVND(data.min_price);
      return `${fmtVND(data.min_price)} - ${fmtVND(data.max_price)}`;
    }
    return "—";
  }, [selectedVariant, data]);

  const handleAddToCart = () => {
    if (!selectedVariant) return alert("Vui lòng chọn biến thể hợp lệ.");
    // TODO: dispatch(addToCart({ productId: data._id, variantId: selectedVariant.id, qty }))
    console.log("ADD_TO_CART", { productId: data._id, variantId: selectedVariant.id, qty });
    alert("Đã thêm vào giỏ!");
  };

  if (loading) return <DetailSkeleton />;
  if (err) return <Box sx={{ p: 2 }}><Alert severity="error">{err}</Alert></Box>;
  if (!data) return null;

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <Grid container spacing={3}>
        {/* Gallery */}
        <Grid item xs={12} md={6}>
          <Gallery images={images} name={data.name} />
        </Grid>

        {/* Info */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.25}>
            <Typography variant="h5" fontWeight={700}>{data.name}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={Number(data.average_rating || 0)} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {data.review_count || 0} đánh giá
              </Typography>
              <Chip size="small" label={data.status === "ACTIVE" ? "Còn hàng" : "Tạm hết"} color={data.status === "ACTIVE" ? "success" : "default"} />
            </Stack>

            <Typography variant="h6" color="error" fontWeight={800}>{priceText}</Typography>

            {/* Color */}
            {!!colors.length && (
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">Màu sắc</Typography>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  value={color}
                  onChange={(_, v) => v && setColor(v)}
                >
                  {colors.map(c => (
                    <ToggleButton key={c} value={c} size="small">{c}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            )}

            {/* Storage */}
            {!!storages.length && (
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">Dung lượng</Typography>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  value={storage}
                  onChange={(_, v) => v && setStorage(v)}
                >
                  {storages.map(s => (
                    <ToggleButton key={s} value={s} size="small">{s}</ToggleButton>
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
                inputProps={{ min: 1, max: selectedVariant?.stock_quantity ?? 99 }}
                value={qty}
                onChange={e => setQty(Math.max(1, Number(e.target.value || 1)))}
                sx={{ width: 120 }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCart />}
                disabled={!selectedVariant}
                onClick={handleAddToCart}
              >
                Thêm vào giỏ
              </Button>
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* Specs */}
            {!!data.specifications?.length && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Thông số kỹ thuật</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                  {data.specifications.map((s, i) => (
                    <Box key={i} sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">{s.key}</Typography>
                      <Typography variant="body2">{s.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Mô tả & đánh giá (placeholder) */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Mô tả</Typography>
          <Typography variant="body1" color="text.secondary">{data.description || "—"}</Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Đánh giá</Typography>
          <Alert severity="info">
            Khu vực đánh giá/bình luận (có thể tích hợp WebSocket để hiển thị realtime).
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ------------ Gallery component ------------- */
function Gallery({ images = [], name = "" }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <Skeleton variant="rectangular" height={360} />;

  return (
    <Box>
      <Box
        sx={{
          width: "100%", bgcolor: "background.paper", borderRadius: 2, mb: 1.5,
          overflow: "hidden", display: "grid", placeItems: "center",
          aspectRatio: "1 / 1",
        }}
      >
        <img
          src={images[active]}
          alt={`${name}-${active}`}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
        {images.map((src, i) => (
          <Box
            key={i}
            onClick={() => setActive(i)}
            sx={{
              borderRadius: 1,
              border: i === active ? "2px solid" : "1px solid",
              borderColor: i === active ? "primary.main" : "divider",
              width: 72, height: 72, flex: "0 0 auto", overflow: "hidden",
              display: "grid", placeItems: "center", cursor: "pointer", bgcolor: "background.paper",
            }}
            title={`Ảnh ${i + 1}`}
          >
            <img src={src} alt={`${name}-thumb-${i}`} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ------------ Helpers ------------- */
function fmtVND(v) {
  if (v == null) return "—";
  try { return v.toLocaleString("vi-VN") + "₫"; } catch { return `${v}₫`; }
}

function normalizeUrl(path = "") {
  // build absolute URL từ API_DOMAIN + path, tránh // trùng
  const base = (API_DOMAIN || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return `${base}/${p}`;
}

function DetailSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" sx={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 2 }} />
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={72} height={72} sx={{ borderRadius: 1 }} />
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
