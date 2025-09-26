import LayoutDefault from "../components/layout/LayoutDefault/LayoutDefault";
import Login from "../components/pages/Login";
import Logout from "../components/pages/Logout";
import ErrorPage from "../components/pages/ErrorPage";
import Home from "../components/pages/Home/Home";

export const routes = [
  {
    path: "/login",
    element: <Login />,
  }, 
  {
    path: "/logout",
    element: <Logout />,
  }, 
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage status={404} message={"Page Not Found"} />,
  },
];
