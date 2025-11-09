import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import theme from './config/theme';
import AllRoute from './routes/AllRoute'; 
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "./redux/reducers/authSlice";
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (token && user) {
            dispatch(login({ user: JSON.parse(user), token }));
        }
    }, [dispatch]);
    return (
        <div className="App">
            {/* Thêm GoogleOAuthProvider và truyền clientId */}
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AllRoute />
                </ThemeProvider>
            </GoogleOAuthProvider>
        </div>
    );
}

export default App;