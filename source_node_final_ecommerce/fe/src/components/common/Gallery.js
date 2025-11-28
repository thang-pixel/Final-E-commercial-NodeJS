import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton, Skeleton } from "@mui/material";
import { useState } from "react";

/* ------------ Gallery component ------------- */
function Gallery({ images = [], name = '' }) {
  const [active, setActive] = useState(0);
  if (!images.length)
    return (
      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 2 }}
      />
    );

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Khung ảnh cố định (vuông), ảnh contain nên không méo/nhảy layout */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          aspectRatio: '1 / 1', // cố định vuông
        }}
      >
        <img
          src={images[active]}
          alt={`${name}-${active}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />

        {/* Nút điều hướng */}
        <IconButton
          onClick={prev}
          size="small"
          sx={{
            position: 'absolute',
            top: '50%',
            left: 8,
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(0,0,0,.45)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,.6)' },
          }}
          aria-label="Previous image"
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={next}
          size="small"
          sx={{
            position: 'absolute',
            top: '50%',
            right: 8,
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(0,0,0,.45)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,.6)' },
          }}
          aria-label="Next image"
        >
          <ChevronRight />
        </IconButton>

        {/* Chỉ số ảnh */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'rgba(0,0,0,.45)',
            color: '#fff',
            fontSize: 12,
          }}
        >
          {active + 1}/{images.length}
        </Box>
      </Box>

      {/* Thumbnails */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mt: 1 }}>
        {images.map((src, i) => (
          <Box
            key={i}
            onClick={() => setActive(i)}
            sx={{
              borderRadius: 1,
              border: i === active ? '2px solid' : '1px solid',
              borderColor: i === active ? 'primary.main' : 'divider',
              width: 72,
              height: 72,
              flex: '0 0 auto',
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              bgcolor: 'background.paper',
            }}
            title={`Ảnh ${i + 1}`}
          >
            <img
              src={src}
              alt={`${name}-thumb-${i}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
export default Gallery;