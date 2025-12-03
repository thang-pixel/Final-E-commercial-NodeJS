import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  AccountCircle,
  Person,
  ListAltOutlined as ListAlt,
  ShoppingCartOutlined as CartIcon,
  Logout,
  Login,
  FavoriteOutlined as Favorite,
} from '@mui/icons-material';

const UserMenuMobile = ({ user, cartLength }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="user-btn-mobile cursor-pointer">
      {/* Button trigger */}
      <div
        onClick={handleOpen}
        id="user-menu-button"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        className="text-white"
      >
        <AccountCircle />
      </div>

      {/* Menu dropdown */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 220,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Hiển thị tên user nếu đã login */}
        {user && (
          <>
            <MenuItem disabled sx={{ opacity: 1, fontWeight: 600 }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {user?.username || user?.full_name || user?.email}
              </ListItemText>
            </MenuItem>
            <Divider />
          </>
        )}

        {/* Menu items cho user đã login */}
        {user ? (
          <>
            <MenuItem
              component={Link}
              to="/account/profile"
              onClick={handleClose}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Tài khoản của tôi</ListItemText>
            </MenuItem>

            <MenuItem
              component={Link}
              to="/account/orders"
              onClick={handleClose}
            >
              <ListItemIcon>
                <ListAlt fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đơn hàng của tôi</ListItemText>
            </MenuItem>

            <MenuItem
              component={Link}
              to="/account/carts"
              onClick={handleClose}
            >
              <ListItemIcon>
                <Badge color="error" badgeContent={cartLength} max={99}>
                  <CartIcon fontSize="small" />
                </Badge>
              </ListItemIcon>
              <ListItemText>Giỏ hàng của tôi</ListItemText>
            </MenuItem>

            <MenuItem
              component={Link}
              to="/account/favorites"
              onClick={handleClose}
            >
              <ListItemIcon>
                <Favorite fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sản phẩm yêu thích</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem
              component={Link}
              to="/logout"
              onClick={handleClose}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Đăng xuất</ListItemText>
            </MenuItem>
          </>
        ) : (
          /* Menu items cho khách chưa login */
          <>
            <MenuItem
              component={Link}
              to="/login"
              onClick={handleClose}
              sx={{ color: 'primary.main' }}
            >
              <ListItemIcon>
                <Login fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Đăng nhập</ListItemText>
            </MenuItem>

            <MenuItem
              component={Link}
              to="/register"
              onClick={handleClose}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đăng ký tài khoản</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem
              component={Link}
              to="/products"
              onClick={handleClose}
            >
              <ListItemIcon>
                <CartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Xem sản phẩm</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </div>
  );
};

export default UserMenuMobile;