import { useState } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle,
  Slide
} from '@mui/material';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
    title: '',
    duration: 4000
  });

  const showNotification = (message, severity = 'success', title = '', duration = 4000) => {
    setNotification({
      open: true,
      message,
      severity,
      title,
      duration
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const NotificationComponent = () => (
    <Snackbar
      open={notification.open}
      autoHideDuration={notification.duration}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert 
        onClose={hideNotification} 
        severity={notification.severity}
        variant="filled"
        sx={{ 
          width: '100%',
          boxShadow: 3,
          minWidth: 300,
          '& .MuiAlert-icon': {
            fontSize: '1.5rem'
          }
        }}
      >
        {notification.title && (
          <AlertTitle sx={{ fontWeight: 600 }}>
            {notification.title}
          </AlertTitle>
        )}
        {notification.message}
      </Alert>
    </Snackbar>
  );

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
    // Shorthand methods
    showSuccess: (message, title = 'Thành công!') => 
      showNotification(message, 'success', title),
    showError: (message, title = 'Lỗi!') => 
      showNotification(message, 'error', title, 6000),
    showWarning: (message, title = 'Cảnh báo!') => 
      showNotification(message, 'warning', title),
    showInfo: (message, title = 'Thông báo!') => 
      showNotification(message, 'info', title)
  };
};

export default useNotification;