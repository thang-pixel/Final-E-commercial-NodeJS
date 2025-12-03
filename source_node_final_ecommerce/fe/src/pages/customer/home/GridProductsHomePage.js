import { useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ProductCard from '../../../components/customer/ProductCard';
import './GridProductsHomePage.css';

export default function GridProductsHomePage({
  products = [],
  gap = 2,
}) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth * 0.7;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      {/* Nút prev */}
      <IconButton
        onClick={() => scroll('left')}
        sx={{
          position: 'absolute',
          left: { xs: 0, md: -20 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'white',
          boxShadow: 2,
          opacity: 0.9,
          '&:hover': { bgcolor: 'grey.100', opacity: 1 },
        }}
        size="small"
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      {/* Nút next */}
      <IconButton
        onClick={() => scroll('right')}
        sx={{
          position: 'absolute',
          right: { xs: 0, md: -20 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'white',
          boxShadow: 2,
          opacity: 0.9,
          '&:hover': { bgcolor: 'grey.100', opacity: 1 },
        }}
        size="small"
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      {/* Carousel container - cuộn ngang */}
      <Box
        ref={scrollContainerRef}
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.400',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'grey.100',
          },
          // ẩn scrollbar trên mobile
          '@media (max-width: 900px)': {
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap,
            width: 'max-content',
            px: { xs: 0.5, md: 1 },
          }}
        >
          {products.map((p) => (
            <Box
              key={p.id ?? p._id}
              sx={{
                minWidth: {
                  xs: '160px',
                  sm: '200px',
                  md: '240px',
                  lg: '280px',
                },
                maxWidth: {
                  xs: '160px',
                  sm: '200px',
                  md: '240px',
                  lg: '280px',
                },
                flexShrink: 0,
              }}
            >
              <ProductCard product={p} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}