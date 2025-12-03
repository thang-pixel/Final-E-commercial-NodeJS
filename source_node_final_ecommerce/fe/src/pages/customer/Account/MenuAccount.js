import { CardTravelOutlined, List, ListAlt, Person } from "@mui/icons-material";
import { Box } from "@mui/material";
import { Flex } from "antd";
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
            mb: 2,
            '& a': {
              textDecoration: 'none',
              color: 'inherit',
            }, 
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Link to="/account/profile"><Person /> Hồ sơ</Link>
        </Box>
        <Box
          component="li"
          sx={{
            mb: 2,
            '& a': {
              textDecoration: 'none',
              color: 'inherit',
            },
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Link to="/account/carts"><CardTravelOutlined /> Giỏ hàng</Link>
        </Box>
        <Box
          component="li"
          sx={{
            mb: 2,
            '& a': {
              textDecoration: 'none',
              color: 'inherit',
            },
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Link to="/account/orders"><ListAlt /> Đơn hàng</Link>
        </Box>
      </Box>
    </>
  );
};

export default MenuAccount;