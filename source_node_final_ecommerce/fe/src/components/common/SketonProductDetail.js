import { Box, Grid, Skeleton } from "@mui/material";

const SkeletonProductDetail = () => {
  return (<>
    <Box sx={{ display: 'flex', gap: 2, width:'100%' }}>
      <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="text" width="60%" height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="40%" height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="90%" height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="90%" height={150} sx={{ mb: 2 }} />
        </Grid>

        <Grid size={12}>
          <Skeleton variant="text" width="100%" height={200} sx={{ mb: 2 }} />
        </Grid> 
      </Grid>
    </Box>
  </> );
}

export default SkeletonProductDetail;