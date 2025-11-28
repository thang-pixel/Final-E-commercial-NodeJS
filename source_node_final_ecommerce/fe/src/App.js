import './App.css';
// import theme from './config/theme';
import AllRoute from './routes/AllRoute';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './redux/reducers/authSlice';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useGlobalLoading } from './context/LoadingContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';


const antIconLoading = <LoadingOutlined style={{ fontSize: 64 }} spin />;

function App() {
  const dispatch = useDispatch();

  // spinning global loading
  const { spinning, setSpinning } = useGlobalLoading();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      dispatch(login({ user: JSON.parse(user), token }));
    }
  }, [dispatch]);
  return (
    <div className="App">
      <Spin spinning={spinning} indicator={antIconLoading} fullscreen={true} />
      {/* Thêm GoogleOAuthProvider và truyền clientId */}
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AllRoute />
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
