import { useSelector } from "react-redux";

function useAuth() {
  const { user, token } = useSelector((state) => state.auth);
  const isLoggedIn = !!token;

  return { user, token, isLoggedIn };
}

export default useAuth;