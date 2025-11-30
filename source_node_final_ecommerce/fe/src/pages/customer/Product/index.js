// src/pages/customer/ProductList.jsx
import { use, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Pagination,
  Typography,
  Skeleton,
  Chip,
  Autocomplete,
  IconButton,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ProductCard from '../../../components/customer/ProductCard';
import { api } from '../../../api/axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FilterAltOutlined } from '@mui/icons-material';

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'createdAt_desc' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
  { label: 'Tên A→Z', value: 'name_asc' },
  { label: 'Tên Z→A', value: 'name_desc' },
  { label: 'Đánh giá cao', value: 'rating_desc' },
];

const PRICE_PRESETS = [
  [0, 1_000_000],
  [1_000_000, 5_000_000],
  [5_000_000, 10_000_000],
  [10_000_000, 20_000_000],
];

export default function ProductList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- helpers đọc từ URL ---
  const getArrayParam = (name) => {
    // hỗ trợ dạng repeat: ?brand_ids=1&brand_ids=2 hoặc dạng CSV: ?brand_ids=1,2
    const all = searchParams.getAll(name);
    if (all && all.length) return all;
    const csv = searchParams.get(name);
    return csv ? csv.split(',') : [];
  };
  const getRangesParam = (name) => {
    // ?range_prices=0-1000000&range_prices=1000000-5000000
    const all = searchParams.getAll(name);
    const csv = searchParams.get(name);
    const list = all.length ? all : csv ? csv.split(',') : [];
    return list
      .map((s) => s.split('-').map(Number))
      .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b >= a);
  };

  const categorySlugFromUrl = searchParams.get('category_slug') || '';

  // ------- data -------
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // ------- FILTER đang ÁP DỤNG -------
  const [q, setQ] = useState(searchParams.get('keyword') || '');
  const [sort, setSort] = useState(
    searchParams.get('sort') || 'createdAt_desc'
  );
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 8);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [categoryId, setCategoryId] = useState(
    searchParams.get('category_id') || null
  );
  const [brandIds, setBrandIds] = useState(
    getArrayParam('brand_ids').map(String)
  );
  const [priceRanges, setPriceRanges] = useState(
    getRangesParam('range_prices')
  );

  // ------- FILTER DRAFT (sync theo URL ban đầu) -------
  const [qDraft, setQDraft] = useState(q);
  const [sortDraft, setSortDraft] = useState(sort);
  const [limitDraft, setLimitDraft] = useState(limit);
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [brandsDraft, setBrandsDraft] = useState([]);
  const [rangesDraft, setRangesDraft] = useState(priceRanges);
  // const [newMin, setNewMin] = useState('');
  // const [newMax, setNewMax] = useState('');

  const [sliderDraft, setSliderDraft] = useState(
    priceRanges.length ? priceRanges[0] : [0, 100_000_000]
  );
  const PRICE_MIN = 0;
  const PRICE_MAX = 100_000_000;
  const PRICE_STEP = 100_000;

  // fetch categories/brands
  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get('/api/categories', { params: { limit: 200 } }),
      api.get('/api/brands', { params: { limit: 200 } }),
    ])
      .then(([rc, rb]) => {
        if (!mounted) return;
        const cats = rc.data?.data || [];
        const brs = rb.data?.data || [];
        setCategories(cats);
        setBrands(brs);

        // map URL -> object draft (sau khi có dữ liệu)
        // category_slug ưu tiên nếu có, tìm object tương ứng
        if (categorySlugFromUrl) {
          const catObj = cats.find((c) => c.slug === categorySlugFromUrl);
          if (catObj) {
            setCategoryDraft(catObj);
            setCategoryId(catObj._id);
          }
        } else if (categoryId) {
          const catObj = cats.find((c) => c._id === categoryId);
          if (catObj) setCategoryDraft(catObj);
        }

        if (brandIds.length) {
          const brandObjs = brs.filter((b) => brandIds.includes(String(b._id)));
          setBrandsDraft(brandObjs);
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []); // load 1 lần

  // build query áp dụng
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      sort,
      keyword: q || '',
      category_slug: categorySlugFromUrl || undefined,
      category_id: categoryId || undefined,
      brand_ids: brandIds.length ? brandIds : undefined,
      range_prices: priceRanges.length
        ? priceRanges.map(([a, b]) => `${a}-${b}`)
        : undefined,
    }),
    [
      page,
      limit,
      sort,
      q,
      categoryId,
      brandIds,
      priceRanges,
      categorySlugFromUrl,
    ]
  );

  // fetch list
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get('/api/products', { params: queryParams })
      .then((res) => {
        const data = res.data?.data || res.data?.items || [];
        const m = res.data?.meta || {
          totalItems: data.length,
          totalPages: 1,
          page,
        };
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
    return () => {
      mounted = false;
    };
  }, [queryParams, page]);

  // Apply: cập nhật state + URL
  const handleApply = () => {
    setQ(qDraft.trim());
    setSort(sortDraft);
    setLimit(limitDraft);
    setPage(1);

    setCategoryId(categoryDraft?._id ?? null);
    setBrandIds(brandsDraft.map((b) => String(b._id)));

    const ranges = rangesDraft.slice();
    if (sliderDraft[1] >= sliderDraft[0]) {
      const exists = ranges.some(
        ([a, b]) => a === sliderDraft[0] && b === sliderDraft[1]
      );
      if (!exists) ranges.push(sliderDraft);
    }
    setPriceRanges(ranges);

    const next = {
      page: 1,
      limit: limitDraft,
      sort: sortDraft,
      keyword: qDraft.trim() || undefined,
      category_slug: categorySlugFromUrl || undefined,
      category_id: categoryDraft?._id || undefined,
      brand_ids: brandsDraft.length ? brandsDraft.map((b) => b._id) : undefined,
      range_prices: ranges.length
        ? ranges.map(([a, b]) => `${a}-${b}`)
        : undefined,
    };
    const usp = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((vv) => usp.append(k, vv));
      } else {
        usp.set(k, String(v));
      }
    });
    navigate('?' + usp.toString(), { replace: true });
  };

  const applyPage = (nextPage) => {
    setPage(nextPage);
    const usp = new URLSearchParams(searchParams);
    usp.set('page', String(nextPage));
    navigate('?' + usp.toString(), { replace: true });
  };

  // Reset
  const handleReset = () => {
    setQDraft('');
    setSortDraft('createdAt_desc');
    setLimitDraft(8);
    setCategoryDraft(null);
    setBrandsDraft([]);
    setRangesDraft([]);
    setSliderDraft([0, 20_000_000]); // reset slider
    // setNewMin('');
    // setNewMax('');

    setQ('');
    setSort('createdAt_desc');
    setLimit(8);
    setCategoryId(null);
    setBrandIds([]);
    setPriceRanges([]);
    setPage(1);
  };

  const removeRangeDraft = (idx) =>
    setRangesDraft((prev) => prev.filter((_, i) => i !== idx));

  // label applied filters
  const appliedChips = [
    q && {
      key: 'q',
      label: `Từ khoá: "${q}"`,
      onDelete: () => {
        setQ('');
        setQDraft('');
        setPage(1);
      },
    },
    categoryId && {
      key: 'cat',
      label: `Danh mục: ${
        categories.find((c) => c._id === categoryId)?.name || categoryId
      }`,
      onDelete: () => {
        setCategoryId(null);
        setCategoryDraft(null);
        setPage(1);
      },
    },
    ...brandIds.map((id) => ({
      key: `brand-${id}`,
      label: `Brand: ${brands.find((b) => b._id === id)?.name || id}`,
      onDelete: () => {
        setBrandIds((prev) => prev.filter((x) => x !== id));
        setBrandsDraft((prev) => prev.filter((b) => b._id !== id));
        setPage(1);
      },
    })),
    ...priceRanges.map(([a, b], i) => ({
      key: `range-${i}`,
      label: `${fmtVND(a)} - ${fmtVND(b)}`,
      onDelete: () => {
        setPriceRanges((prev) => prev.filter((_, idx) => idx !== i));
        setRangesDraft((prev) => prev.filter((_, idx) => idx !== i));
        setPage(1);
      },
    })),
  ].filter(Boolean);

  // ...existing code...
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const [openFilter, setOpenFilter] = useState(false);

  // ...existing code (states, effects, handlers)...

  const renderFilterPanel = () => (
    <Stack spacing={2}>
      {/* Tìm kiếm + bộ lọc cơ bản */}
      <Stack direction="column" spacing={2}>
        {/* Danh mục (single) */}
        <Autocomplete
          size="small"
          options={categories}
          getOptionLabel={(o) => o?.name || ''}
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
          getOptionLabel={(o) => o?.name || ''}
          value={brandsDraft}
          onChange={(_, v) => setBrandsDraft(v)}
          renderInput={(params) => (
            <TextField {...params} label="Thương hiệu" />
          )}
          sx={{ minWidth: 220 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Hiển thị</InputLabel>
          <Select
            label="Hiển thị"
            value={limitDraft}
            onChange={(e) => setLimitDraft(Number(e.target.value))}
          >
            {[4, 8, 12, 16, 20, 24].map((n) => (
              <MenuItem key={n} value={n}>
                {n}/trang
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* PRICE RANGES */}
      <Stack spacing={1.5}>
        <Typography variant="caption" color="text.secondary">
          Khoảng giá (chọn nhiều)
        </Typography>
        <Stack direction="column" spacing={1} gap={1} flexWrap="wrap">
          {PRICE_PRESETS.map(([a, b], i) => (
            <Chip
              key={i}
              label={`${fmtVND(a)} - ${fmtVND(b)}`}
              onClick={() =>
                setRangesDraft((prev) =>
                  prev.some((p) => p[0] === a && p[1] === b)
                    ? prev
                    : [...prev, [a, b]]
                )
              }
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>

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
                const v = Number(e.target.value.replace(/\D/g, '')) || 0;
                setSliderDraft(([_, max]) => [
                  Math.min(Math.max(PRICE_MIN, v), max),
                  max,
                ]);
              }}
              sx={{ width: 150 }}
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              size="small"
              label="Đến"
              value={sliderDraft[1].toString()}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/\D/g, '')) || 0;
                setSliderDraft(([min, _]) => [
                  min,
                  Math.max(Math.min(PRICE_MAX, v), min),
                ]);
              }}
              sx={{ width: 150 }}
              inputProps={{ inputMode: 'numeric' }}
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
              getAriaLabel={() => 'Price range'}
              getAriaValueText={(val) => fmtVND(val)}
            />
          </Box>
        </Stack>

        <Stack direction="column" spacing={1} flexWrap="wrap">
          {rangesDraft.map(([a, b], idx) => (
            <Chip
              key={idx}
              color="primary"
              size="small"
              label={`${fmtVND(a)} - ${fmtVND(b)}`}
              onDelete={() => removeRangeDraft(idx)}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => {
              handleApply();
              if (isSmDown) setOpenFilter(false);
            }}
          >
            Áp dụng
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
  return (
    <Box sx={{ px: { xs: 1.5, md: 2 }, pb: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Product List
      </Typography>

      {/* Applied chips */}
      {appliedChips.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {appliedChips.map((ch) => (
            <Chip
              key={ch.key}
              label={ch.label}
              onDelete={ch.onDelete}
              color="default"
              size="small"
            />
          ))}
        </Stack>
      )}

      {/* Main layout: Sidebar (md+) + Content */}
      <Grid container spacing={3}>
        {/* Sidebar filter (md and up) */}
        <Grid
          item
          size={{ xs: 12, md: 3 }}
          sx={{
            display: { xs: 'none', md: 'block' },
            backgroundColor: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: 2,
            boxShadow: 'var(--box-shadow)',
            p: 2,
          }}
        >
          <Box sx={{ position: 'sticky', top: 16 }}>{renderFilterPanel()}</Box>
        </Grid>

        {/* Content */}
        <Grid item size={{ xs: 12, md: 9 }}>
          {/* TOP controls: pagination + Filter button on mobile */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5, flexWrap: 'wrap' }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                value={qDraft}
                onChange={(e) => {
                  setQDraft(e.target.value);
                  // setQ(e.target.value);
                  handleApply();
                }}
                size="small"
                placeholder="Tìm sản phẩm…"
                InputProps={{
                  startAdornment: (
                    <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                  ),
                }}
                sx={{ minWidth: 220, flex: 1 }}
              />
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              bgcolor: 'background.paper',
              padding: 1,
              borderRadius: 1,
            }}
          >
            <Grid container spacing={1} width={'100%'} alignItems="center">
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {/* Left group: Sort + Page navigation + total items */}

                {/* Page controls */}
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

                {/* Total items */}
                <Typography variant="body2" color="text.secondary">
                  Tổng sản phẩm: <b>{meta.totalItems ?? items.length}</b>
                </Typography>

              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: { xs: 1, md: 0 } }}>
                
                {/* Sort moved to left */}
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Sắp xếp</InputLabel>
                  <Select
                    label="Sắp xếp"
                    value={sortDraft}
                    onChange={(e) => {
                      setSortDraft(e.target.value);
                      setSort(e.target.value);
                    }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Right group: Pagination + Mobile filter */}
                <Pagination
                  color="primary"
                  page={page}
                  onChange={(_, v) => applyPage(v)}
                  count={meta.totalPages || 1}
                  size="small"
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterAltOutlined />}
                  onClick={() => setOpenFilter(true)}
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                >
                  Bộ lọc
                </Button>
              </Grid>
            </Grid>
          </Stack>
          {/* GRID */}
          {loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: limit }).map((_, i) => (
                <Grid
                  key={i}
                  item
                  size={{ xs: 6, sm: 4, md: 4, lg: 3 }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  <Skeleton
                    variant="rounded"
                    sx={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: 2,
                    }}
                  />
                  <Skeleton height={100} />
                  <Skeleton height={50} width="60%" />
                </Grid>
              ))}
            </Grid>
          ) : items.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              Không tìm thấy sản phẩm phù hợp.
            </Box>
          ) : (
            <Grid container spacing={2} alignItems="stretch" wrap="wrap">
              {items.map((p) => (
                <Grid
                  key={p._id ?? p.slug}
                  item
                  size={{ xs: 6, sm: 4, md: 4, lg: 3 }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <ProductCard product={p} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Filter modal (xs/sm) */}
      <Dialog
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        fullScreen={isSmDown}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Bộ lọc</DialogTitle>
        <DialogContent dividers>{renderFilterPanel()}</DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => handleReset()}
            startIcon={<RefreshIcon />}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleApply();
              setOpenFilter(false);
            }}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function fmtVND(n) {
  const v = Number(n || 0);
  return v.toLocaleString('vi-VN') + '₫';
}
