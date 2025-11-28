// acccount page: profile, orders, carts, etc.

import { Box, Container, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';
import MenuAccount from './MenuAccount';

const AccountCustomer = () => {
  return (
    <>
      <Container maxWidth="xl" sx={{ pt: 0, pb: 1 }}>
        <Box
        
          sx={{
            mt: 1,
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexShrink: 0,

            alignItems: 'stretch',
            // minHeight: '70vh',
          }}
        >
          {/* menu sidebar */}
          <Box className="hidden md:block">
            <Box
              sx={{
                minWidth: '200px',
                p: 1,
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 2,
                boxShadow: 'var(--box-shadow)',
              }}
            >
              <Typography variant="h6" gutterBottom textAlign={'center'}>
                Account Menu
              </Typography>
              <MenuAccount />
            </Box>
          </Box>

          {/* Page matches routes account/* */}
          <Box
            sx={{
              flexGrow: 1,
              // p: 1,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 2,
                boxShadow: 'var(--box-shadow)',
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AccountCustomer;
