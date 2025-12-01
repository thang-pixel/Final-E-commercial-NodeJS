import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertRating({ isOpen, setIsOpen }) { 
  const navigate = useNavigate();
 

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/login');
  }

  return (
    <div> 
      <Dialog
        open={isOpen}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Vui lòng đăng nhập để đánh giá sản phẩm.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={handleClose}>Đóng</Button>
          <Button variant='contained' onClick={handleLogin}>Đăng nhập</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
