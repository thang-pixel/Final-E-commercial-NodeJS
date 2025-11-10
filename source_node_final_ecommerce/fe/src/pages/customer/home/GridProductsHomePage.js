import Box from '@mui/material/Box';
import ProductCard from './ProductCard';

export default function GridProductsHomePage({
  products = [],
  rows = 1,
  gap = 2,
}) {
  const col = (minPx, fluid, maxPx) =>
    `clamp(${minPx}px, ${fluid}, ${maxPx}px)`;

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          // cột nhỏ hơn ở mobile, lớn dần theo breakpoint
          gridAutoColumns: {
            xs: col(180, '70vw', 260), // mobile ~70% viewport
            sm: col(200, '40vw', 300), // tablet ~2.5 cards/viewport
            md: col(220, '28vw', 320), // desktop ~3–4 cards
            lg: col(240, '22vw', 360), // large ~4–5 cards
          },
          width: 'max-content', // để tổng chiều rộng > container => scroll
          gap,
          alignItems: 'stretch',
        }}
      >
        {products.map((p) => (
          <>
            <Box key={p.id ?? p._id + 's'} sx={{ height: '100%' }}>
              <ProductCard product={p} />
            </Box>
            <Box key={p.id ?? p._id + 'ss'} sx={{ height: '100%' }}>
              <ProductCard product={p} />
            </Box>
            <Box key={p.id ?? p._id  + 'sss'} sx={{ height: '100%' }}>
              <ProductCard product={p}/>
            </Box>
          </>
        ))}
      </Box>
    </Box>
  );
}
