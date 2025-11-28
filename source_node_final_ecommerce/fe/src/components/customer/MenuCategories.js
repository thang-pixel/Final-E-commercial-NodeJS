import { Button, Menu, MenuItem } from "@mui/material"; 
import { useState } from "react";

export default function MenuCategories() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      {' '}
      <Button
        id="demo-positioned-button"
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {' '}
        Dashboard{' '}
      </Button>{' '}
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {' '}
        <MenuItem onClick={handleClose}>Profile</MenuItem>{' '}
        <MenuItem onClick={handleClose}>My account</MenuItem>{' '}
        <MenuItem onClick={handleClose}>Logout</MenuItem>{' '}
      </Menu>{' '}
    </div>
  );
}
