import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

const ProductsSkeleton = ({ count }) => {
  return (
    <>
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px' }}>
        <Grid container spacing={2} nowrap="nowrap">
          {Array.from({ length: count }).map((_, i) => (
            <Grid key={i} item size={{ xs: 6, sm: 4, md: 3 }}>
              <Skeleton
                variant="rounded"
                sx={{
                  width: '100%',
                  height: '150px',
                  aspectRatio: '1 / 1',
                  borderRadius: 2,
                }}
              />
              <Skeleton sx={{ width: '100%', height: '100px', mt: 1 }} />
              <Skeleton sx={{ width: '100%', height: '50px' }} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};
export default ProductsSkeleton;
