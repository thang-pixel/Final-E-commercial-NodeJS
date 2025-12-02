import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography"; 
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchHomeData } from "../../../redux/reducers/homeSlice";
import HomePageSkeleton from "../Skeleton/HomePageSkeleton";
import NewProducts from "./NewProducts";
import BestSellersProducts from "./BestSellersProducts";
import ProductByCategory from "./ProductByCategory";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Dữ liệu carousel banners
const BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    title: 'Siêu sale điện thoại',
    subtitle: 'Giảm giá lên đến 50%',
    color: '#1976d2',
    link: '/products?category_slug=dien-thoai',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&h=400&fit=crop',
    title: 'Laptop Gaming hot nhất',
    subtitle: 'Trả góp 0% - Freeship toàn quốc',
    color: '#d32f2f',
    link: '/products?category_slug=laptop',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1200&h=400&fit=crop',
    title: 'Phụ kiện công nghệ',
    subtitle: 'Mua 1 tặng 1',
    color: '#388e3c',
    link: '/products',
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <Box sx={{ pb: 8 }}>
      {/* Hero Carousel */}
      <Box sx={{ mb: 4 }}>
        <Carousel autoplay autoplaySpeed={4000} effect="fade">
          {BANNERS.map((banner) => (
            <Box key={banner.id}>
              <Box
                onClick={() => navigate(banner.link)}
                sx={{
                  position: 'relative',
                  height: { xs: '300px', md: '450px' },
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Container maxWidth="lg">
                  <Box
                    sx={{
                      maxWidth: 600,
                      color: 'white',
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    <Typography
                      variant="h2"
                      fontWeight={900}
                      sx={{
                        fontSize: { xs: '2rem', md: '3.5rem' },
                        textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                        mb: 2,
                      }}
                    >
                      {banner.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.5rem' },
                        textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
                        mb: 3,
                      }}
                    >
                      {banner.subtitle}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCartIcon />}
                      sx={{
                        bgcolor: banner.color,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: banner.color,
                          filter: 'brightness(1.1)',
                        },
                      }}
                    >
                      Mua ngay
                    </Button>
                  </Box>
                </Container>
              </Box>
            </Box>
          ))}
        </Carousel>
      </Box>

      {/* Welcome Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            px: 2,
            bgcolor: 'primary.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.200',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Chào mừng đến E-Shop
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Khám phá sản phẩm mới, bán chạy và các danh mục nổi bật với giá tốt nhất.
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="large"
            startIcon={<TrendingUpIcon />}
          >
            Khám phá ngay
          </Button>
        </Box>
      </Container>

      {/* Products Sections */}
      <Container maxWidth="lg">
        {/* New Products */}
        <SectionHeader 
          title="Sản phẩm mới" 
          to="/products?sort=createdAt_desc&limit=12" 
        />
        <NewProducts data={newProducts} />

        {/* Best Sellers */}
        <SectionHeader 
          title="Bán chạy nhất" 
          to="/products?sort=best_sellers&limit=12" 
        />
        <BestSellersProducts data={bestSellers} />

        {/* Phones */}
        <SectionHeader 
          title="Điện thoại" 
          to="/products?category_slug=dien-thoai&limit=12" 
        />
        <ProductByCategory data={categories[11]} />

        {/* Desktop */}
        <SectionHeader 
          title="Desktop" 
          to="/products?category_slug=desktop&limit=12" 
        />
        <ProductByCategory data={categories[14]} />

        {/* Laptop */}
        <SectionHeader 
          title="Laptop" 
          to="/products?category_slug=laptop&limit=12" 
        />
        <ProductByCategory data={categories[15]} />
      </Container>
    </Box>
  );
}

function SectionHeader({ title, to }) {
  return (
    <Box
      sx={{
        mb: 3,
        mt: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pb: 1,
        borderBottom: '3px solid',
        borderColor: 'primary.main',
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        {title}
      </Typography>
      <Link 
        to={to} 
        style={{ 
          color: 'var(--color-primary-dark)',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Xem tất cả →
      </Link>
    </Box>
  );
}