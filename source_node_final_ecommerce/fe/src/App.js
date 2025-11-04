import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import theme from './config/theme';
import AllRoute from './routes/AllRoute'; 
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "./redux/reducers/authSlice";
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
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AllRoute />
            </ThemeProvider>
        </div>
    );
}

export default App;