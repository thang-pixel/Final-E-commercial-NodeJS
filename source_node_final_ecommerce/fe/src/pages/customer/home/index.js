import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Link, Link as RouterLink } from "react-router-dom";

import NewProducts from "./NewProducts";
import BestSellersProducts from "./BestSellersProducts";
import ProductByCategory from "./ProductByCategory";

export default function Home() {
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
        {/* New + Best Sellers */}
        <Grid container spacing={4} >
          <Grid item size={12}>
            <SectionHeader
              title="New Products"
              to="/products?sort=createdAt_desc"
            />
            <NewProducts limit={8} />
          </Grid>
          <Grid item size={12}>
            <SectionHeader
              title="Best Sellers"
              to="/products?sort=best_sellers"
            />
            <BestSellersProducts limit={8} />
          </Grid>
        </Grid>

        {/* Ít nhất 3 danh mục riêng biệt */}
        <Box sx={{ mt: 6 }}>
          <SectionHeader title="Điện thoại" to="/products?category=phones" />
          <ProductByCategory slug="phones" category_id={11} limit={8} />
        </Box>

        <Box sx={{ mt: 6 }}>
          <SectionHeader title="Desktop" to="/products?category=laptop" />
          <ProductByCategory slug="laptop" category_id={14} limit={8} />
        </Box>

        <Box sx={{ mt: 6 }}>
          <SectionHeader title="Laptop" to="/products?category=hard-drives" />
          <ProductByCategory slug="hard-drives" category_id={15} limit={8} />
        </Box>
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
