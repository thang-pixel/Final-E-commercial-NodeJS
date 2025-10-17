// import logo from './logo.svg';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import useAuth from './hooks/authHook';
import AdminRoutes from './routes/AdminRoutes';
import CustomerRoutes from './routes/CustomerRoutes';
import { ThemeProvider } from '@emotion/react';
import theme from './config/theme';

function App() {
    const { user } = useAuth();
    return (
        <div className="App">
            {user ? (
                <>
                    {user.role === 'ADMIN' ? (
                        <AdminRoutes />
                    ) : (
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <CustomerRoutes />
                        </ThemeProvider>
                    )}
                </>
            ) : (
                <h1>Please log in.</h1>
            )}
        </div>
    );
}

export default App;
// function App() {
//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <h1 className="text-4xl font-bold text-blue-600">Hello Tailwind 🚀</h1>
//     </div>
//   );
// }

// export default App;
