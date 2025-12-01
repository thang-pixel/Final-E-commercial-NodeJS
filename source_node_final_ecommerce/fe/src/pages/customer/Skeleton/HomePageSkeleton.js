import { Grid, Skeleton } from '@mui/material'; 

const HomePageSkeleton = (title) => {
  const renderSkeletons = (count = 6) => {
    return (
      <>
        <Grid container spacing={2}>
          <Grid
            size={12}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Skeleton sx={{ height: '100%' }}>
              <Skeleton variant="text" width={200} height={40}>
                {title}
              </Skeleton>
              <Skeleton variant="text" width={400} height={30} />
            </Skeleton>
          </Grid>
          <Grid size={12}>
            {
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
                    <Skeleton sx={{ width: '100%', height: '200px', mt: 1 }} />
                    <Skeleton sx={{ width: '100%', height: '100px' }} />
                  </Grid>
                ))}
              </Grid>
            }
          </Grid>
        </Grid>
      </>
    );
  };
  return (
    <>
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ borderRadius: 2, mb: 2 }}
        />

        {renderSkeletons((title = 'New Products'))}

        {renderSkeletons((title = 'Best Sellers'))}

        {renderSkeletons((title = 'Điện thoại'))}

        {renderSkeletons((title = 'Desktop'))}
        {renderSkeletons((title = 'Laptop'))}
      </Grid>
    </>
  );
};

export default HomePageSkeleton;
