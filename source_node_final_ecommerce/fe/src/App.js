// import logo from './logo.svg'; 
import './App.css';
import useAuth from './hooks/authHook';
import AdminRoutes from './routes/AdminRoutes';
import CustomerRoutes from './routes/CustomerRoutes';

function App() {
  const { user } = useAuth();
  return (
    <div className="App">
      {user 
      ? <> 
        {user.role === "ADMIN" ? <AdminRoutes /> : <CustomerRoutes />}
      </>
      : <h1>Please log in.</h1>
    }
    </div>
  );
}

export default App;
