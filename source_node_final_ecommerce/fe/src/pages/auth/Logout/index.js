import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/actions/authAction";
import { clearCartState, clearCartUser } from "../../../redux/reducers/cartSlice";

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Gọi action logout để xóa Redux + localStorage
    dispatch(clearCartState())
    dispatch(clearCartUser());
    dispatch(logoutUser());
    // Chuyển hướng
    navigate("/login");
  }, [dispatch, navigate]);

  return null; // hoặc <p>Đang đăng xuất...</p>
}