// src/pages/customer/ProductList.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Grid, Stack, TextField, Select, MenuItem, InputLabel, FormControl,
  Button, Pagination, Typography, Skeleton, Chip, Autocomplete, IconButton,
  Slider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ProductCard from "../../../components/customer/ProductCard";
import { api } from "../../../api/axios";

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "createdAt_desc" },
  { label: "Giá tăng dần", value: "price_asc" },
  { label: "Giá giảm dần", value: "price_desc" },
  { label: "Tên A→Z", value: "name_asc" },
  { label: "Tên Z→A", value: "name_desc" },
  { label: "Đánh giá cao", value: "rating_desc" },
];

const PRICE_PRESETS = [
  [0, 1_000_000],
  [1_000_000, 5_000_000],
  [5_000_000, 10_000_000],
  [10_000_000, 20_000_000],
];

export default function ProductList() {
  // ------- data -------
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);   // ✅ danh sách category
  const [brands, setBrands] = useState([]);

  // ------- FILTER đang ÁP DỤNG -------
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [limit, setLimit] = useState(12);
  const [page, setPage] = useState(1);

  const [categoryId, setCategoryId] = useState(null); // ✅ chỉ 1 ID
  const [brandIds, setBrandIds] = useState([]);       // mảng ID brand
  const [priceRanges, setPriceRanges] = useState([]);  // mảng [min,max]

  // ------- FILTER DRAFT (chỉ cập nhật khi Apply) -------
  const [qDraft, setQDraft] = useState("");
  const [sortDraft, setSortDraft] = useState("createdAt_desc");
  const [limitDraft, setLimitDraft] = useState(12);

  const [categoryDraft, setCategoryDraft] = useState(null); // object category
  const [brandsDraft, setBrandsDraft] = useState([]);       // array object brand

  const [rangesDraft, setRangesDraft] = useState([]); // array [min,max]
  const [newMin, setNewMin] = useState("");
  const [newMax, setNewMax] = useState("");

  // thêm dưới nhóm DRAFT
  const [sliderDraft, setSliderDraft] = useState([0, 20_000_000]); // mặc định
  const PRICE_MIN = 0;
  const PRICE_MAX = 100_000_000;
  const PRICE_STEP = 100_000;


  // fetch categories/brands
  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get("/api/categories", { params: { limit: 200 } }),
      api.get("/api/brands", { params: { limit: 200 } }),
    ])
      .then(([rc, rb]) => {
        if (!mounted) return;
        setCategories(rc.data?.data || []);
        setBrands(rb.data?.data || []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // build query áp dụng
  const queryParams = useMemo(() => ({
    page,
    limit,
    sort,
    q: q || undefined,
    // ✅ category_id là 1 giá trị duy nhất
    category_id: categoryId || undefined,
    // mảng brands vẫn OK (BE nhận repeat)
    brand_ids: brandIds.length ? brandIds : undefined,
    range_prices: priceRanges.length
      ? priceRanges.map(([a,b]) => `${a}-${b}`)
      : undefined,
  }), [page, limit, sort, q, categoryId, brandIds, priceRanges]);

  // fetch list
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get("/api/products", { params: queryParams })
      .then(res => {
        const data = res.data?.data || res.data?.items || [];
        const m = res.data?.meta || { totalItems: data.length, totalPages: 1, page };
        if (!mounted) return;
        setItems(data);
        setMeta(m);
        if (page > m.totalPages) setPage(m.totalPages || 1);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
        setMeta({ totalItems: 0, totalPages: 1, page: 1 });
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [queryParams, page]);

  // Apply
  const handleApply = () => {
    setQ(qDraft.trim());
    setSort(sortDraft);
    setLimit(limitDraft);
    setPage(1);

    setCategoryId(categoryDraft?._id ?? null);       // ✅ 1 id
    setBrandIds(brandsDraft.map(b => b._id));
    // gộp các range được chọn từ chips + slider
    const ranges = rangesDraft.slice();
    // chỉ thêm nếu hợp lệ và không trùng hệt
    if (sliderDraft[1] >= sliderDraft[0]) {
      const exists = ranges.some(([a,b]) => a === sliderDraft[0] && b === sliderDraft[1]);
      if (!exists) ranges.push(sliderDraft);
    }
    setPriceRanges(ranges);
  };

  // Reset
  const handleReset = () => {
    setQDraft("");
    setSortDraft("createdAt_desc");
    setLimitDraft(12);
    setCategoryDraft(null);
    setBrandsDraft([]);
    setRangesDraft([]);
    setSliderDraft([0, 20_000_000]);   // reset slider
    setNewMin("");
    setNewMax("");

    setQ("");
    setSort("createdAt_desc");
    setLimit(12);
    setCategoryId(null);
    setBrandIds([]); 
    setPriceRanges([]);
    setPage(1);

  };

  const addRangeDraft = () => {
    const a = Number(newMin), b = Number(newMax);
    if (Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b > 0 && b >= a) {
      setRangesDraft(prev => [...prev, [a,b]]);
      setNewMin(""); setNewMax("");
    }
  };
  const removeRangeDraft = (idx) => setRangesDraft(prev => prev.filter((_, i) => i !== idx));

  // label applied filters
  const appliedChips = [
    q && { key: "q", label: `Từ khoá: "${q}"`, onDelete: () => { setQ(""); setQDraft(""); setPage(1);} },
    categoryId && {
      key: "cat",
      label: `Danh mục: ${categories.find(c => c._id === categoryId)?.name || categoryId}`,
      onDelete: () => { setCategoryId(null); setCategoryDraft(null); setPage(1); }
    },
    ...brandIds.map((id) => ({
      key: `brand-${id}`,
      label: `Brand: ${brands.find(b => b._id === id)?.name || id}`,
      onDelete: () => {
        setBrandIds(prev => prev.filter(x => x !== id));
        setBrandsDraft(prev => prev.filter(b => b._id !== id));
        setPage(1);
      }
    })),
    ...priceRanges.map(([a,b], i) => ({
      key: `range-${i}`,
      label: `${fmtVND(a)} - ${fmtVND(b)}`,
      onDelete: () => {
        setPriceRanges(prev => prev.filter((_, idx) => idx !== i));
        setRangesDraft(prev => prev.filter((_, idx) => idx !== i));
        setPage(1);
      }
    })),
  ].filter(Boolean);

  return (
    <Box sx={{ px: { xs: 1.5, md: 2 }, pb: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Product List
      </Typography>

      {/* TOP PAGINATION (ở TRÊN danh sách) */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, flexWrap: "wrap" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="body2">Trang <b>{page}</b> / {meta.totalPages || 1}</Typography>
          <IconButton size="small" onClick={() => setPage(p => Math.min((meta.totalPages || 1), p + 1))} disabled={page >= (meta.totalPages || 1)}>
            <NavigateNextIcon />
          </IconButton>
        </Stack>
        <Pagination color="primary" page={page} onChange={(_, v) => setPage(v)} count={meta.totalPages || 1} size="small" />
      </Stack>

      {/* APPLIED FILTERS chips (hiển thị những gì đang áp dụng) */}
      {appliedChips.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {appliedChips.map(ch => (
            <Chip key={ch.key} label={ch.label} onDelete={ch.onDelete} color="default" size="small" />
          ))}
        </Stack>
      )}

      {/* FILTER DRAFT BAR (chỉ fetch khi Ấn ÁP DỤNG) */}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ mb: 2, alignItems: "stretch" }}>
        <TextField
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          size="small"
          placeholder="Tìm sản phẩm…"
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
          sx={{ minWidth: 220, flex: 1 }}
        />

        {/* Danh mục (single) */}
        <Autocomplete
          size="small"
          options={categories}
          getOptionLabel={(o) => o?.name || ""}
          value={categoryDraft}
          onChange={(_, v) => setCategoryDraft(v)}
          isOptionEqualToValue={(o, v) => o?._id === v?._id}
          renderInput={(params) => <TextField {...params} label="Danh mục" />}
          sx={{ minWidth: 220 }}
        />

        {/* Brand (multiple) */}
        <Autocomplete
          multiple
          size="small"
          options={brands}
          getOptionLabel={(o) => o?.name || ""}
          value={brandsDraft}
          onChange={(_, v) => setBrandsDraft(v)}
          renderInput={(params) => <TextField {...params} label="Thương hiệu" />}
          sx={{ minWidth: 220 }}
        />

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sắp xếp</InputLabel>
          <Select label="Sắp xếp" value={sortDraft} onChange={(e) => setSortDraft(e.target.value)}>
            {SORT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Limit */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Hiển thị</InputLabel>
          <Select label="Hiển thị" value={limitDraft} onChange={(e) => setLimitDraft(Number(e.target.value))}>
            {[4, 8, 12, 16, 20, 24].map(n => <MenuItem key={n} value={n}>{n}/trang</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {/* PRICE RANGES */}
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Khoảng giá (chọn nhiều)</Typography>
        <Stack direction="row" spacing={1} gap={2} flexWrap="wrap">
          {PRICE_PRESETS.map(([a,b], i) => (
            <Chip
              key={i}
              label={`${fmtVND(a)} - ${fmtVND(b)}`}
              onClick={() => setRangesDraft(prev => prev.some(p => p[0]===a && p[1]===b) ? prev : [...prev, [a,b]])}
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>
        {/* SLIDER chọn khoảng giá */}
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Kéo để chọn khoảng giá
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Từ"
              value={sliderDraft[0].toString()}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                setSliderDraft(([_, max]) => [Math.min(Math.max(PRICE_MIN, v), max), max]);
              }}
              sx={{ width: 150 }}
              inputProps={{ inputMode: "numeric" }}
            />
            <TextField
              size="small"
              label="Đến"
              value={sliderDraft[1].toString()}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                setSliderDraft(([min, _]) => [min, Math.max(Math.min(PRICE_MAX, v), min)]);
              }}
              sx={{ width: 150 }}
              inputProps={{ inputMode: "numeric" }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {fmtVND(sliderDraft[0])} – {fmtVND(sliderDraft[1])}
            </Typography>
          </Stack>

          <Box sx={{ px: 1 }}>
            <Slider
              value={sliderDraft}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              onChange={(_, v) => setSliderDraft(v)}
              valueLabelDisplay="auto"
              getAriaLabel={() => "Price range"}
              getAriaValueText={(val) => fmtVND(val)}
            />
          </Box>
        </Stack>

        {/* <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField size="small" label="Từ" value={newMin} onChange={(e) => setNewMin(e.target.value.replace(/\D/g, ""))} sx={{ width: 140 }} inputProps={{ inputMode: "numeric" }} />
          <TextField size="small" label="Đến" value={newMax} onChange={(e) => setNewMax(e.target.value.replace(/\D/g, ""))} sx={{ width: 140 }} inputProps={{ inputMode: "numeric" }} />
          <Button onClick={addRangeDraft} variant="outlined">Thêm khoảng</Button>
        </Stack> */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {rangesDraft.map(([a,b], idx) => (
            <Chip key={idx} color="primary" size="small" label={`${fmtVND(a)} - ${fmtVND(b)}`} onDelete={() => removeRangeDraft(idx)} />
          ))}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={handleApply}>Áp dụng</Button>
          <Button variant="text" startIcon={<RefreshIcon />} onClick={handleReset}>Reset</Button>
        </Stack>
      </Stack>

      {/* GRID */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: limit }).map((_, i) => (
            <Grid key={i} item size={{ xs: 6, sm: 4, md: 3, lg: 2 }} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton variant="rounded" sx={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 2 }} />
              <Skeleton height={18} />
              <Skeleton height={18} width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {items.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
              Không tìm thấy sản phẩm phù hợp.
            </Box>
          ) : (
            <Grid container spacing={2} alignItems="stretch" wrap="wrap">
              {items.map((p) => (
                <Grid key={p._id ?? p.slug} item size={{ xs: 6, sm: 4, md: 3, lg: 2 }} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ width: "100%", height: "100%" }}>
                    <ProductCard product={p} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

function fmtVND(n) {
  const v = Number(n || 0);
  return v.toLocaleString("vi-VN") + "₫";
}
