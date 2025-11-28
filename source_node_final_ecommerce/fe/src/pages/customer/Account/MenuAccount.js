import { Box } from "@mui/material";
import { Link } from "react-router-dom";

const MenuAccount = () => {
  return (
    <>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
        }}
      >
        {/* menu items */}
        <Box
          component="li"
          sx={{
            mb: 1,
            '& a': {
              textDecoration: 'none',
              color: 'inherit',
            },
          }}
        >
          <Link to="/account/profile">Profile</Link>
        </Box>
        <Box
          component="li"
          sx={{
            mb: 1,
            '& a': {
              textDecoration: 'none',
              color: 'inherit',
            },
          }}
        >
          <Link to="/account/carts">Giỏ hàng</Link>
        </Box>
        <Box
          component="li"
          sx={{
            mb: 1,
            '& a': {
              textDecoration: 'none',
              color: 'inherit',
            },
          }}
        >
          <Link to="/account/orders">Đơn hàng</Link>
        </Box>
      </Box>
    </>
  );
};

export default MenuAccount;