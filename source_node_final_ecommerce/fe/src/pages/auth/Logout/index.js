import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/actions/authAction";

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Gọi action logout để xóa Redux + localStorage
    dispatch(logoutUser());
    // Chuyển hướng
    navigate("/login");
  }, [dispatch, navigate]);

  return null; // hoặc <p>Đang đăng xuất...</p>
}