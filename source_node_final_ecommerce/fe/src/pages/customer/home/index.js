import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Link, Link as RouterLink } from "react-router-dom";

import NewProducts from "./NewProducts";
import BestSellersProducts from "./BestSellersProducts";
import ProductByCategory from "./ProductByCategory";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchHomeData } from "../../../redux/reducers/homeSlice";
import HomePageSkeleton from "../Skeleton/HomePageSkeleton";

export default function Home() {
  const dispatch = useDispatch();

  const { loaded, newProducts, bestSellers, categories, loading } = useSelector(
    (state) => state.home
  );

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchHomeData());
    }
  }, [loaded, dispatch]);

  if (loading && !loaded) return <HomePageSkeleton />;
  return (
    <Box sx={{ pb: 8 }} className="p-2 md:p-4 lg:p-6">
      {/* Hero (banner) */}
      <Box sx={{ py: 6, mb: 4 }}>
        {/* <Container maxWidth="lg"> */}
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Chào mừng đến E-Shop
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Khám phá sản phẩm mới, bán chạy và các danh mục nổi bật.
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            size="large"
          >
            Mua ngay
          </Button>
        {/* </Container> */}
      </Box>

      {/* <Container maxWidth="lg"> */}
        {/* New Products */}
      <SectionHeader title="New Products" to="/products?sort=createdAt_desc&limit=12" />
      <NewProducts data={newProducts} />

      {/* Best Sellers */}
      <SectionHeader title="Best Sellers" to="/products?sort=best_sellers&limit=12" />
      <BestSellersProducts data={bestSellers} />

      {/* Phones */}
      <SectionHeader title="Điện thoại" to="/products?category_slug=dien-thoai&limit=12" />
      <ProductByCategory data={categories[11]} />

      {/* Desktop */}
      <SectionHeader title="Desktop" to="/products?category_slug=desktop&limit=12" />
      <ProductByCategory data={categories[14]} />

      {/* Laptop */}
      <SectionHeader title="Laptop" to="/products?category_slug=laptop&limit=12" />
      <ProductByCategory data={categories[15]} />
      {/* </Container> */}
    </Box>
  );
}

function SectionHeader({ title, to }) {
  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      <Link to={to} style={{ color: 'var(--color-primary-dark)'}}>Xem tất cả</Link>

    </Box>
  );
}
