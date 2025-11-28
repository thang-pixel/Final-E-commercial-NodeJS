import { Link } from "react-router-dom";

function ErrorPage({ role, status, message }) {
  // Gán giá trị mặc định nếu không được truyền vào
  const defaultStatus = status || 404;
  const defaultMessage =
    message || "Rất tiếc, trang bạn đang tìm kiếm không tồn tại.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-8xl font-extrabold text-red-600 mb-4 animate-bounce">
          {defaultStatus}
        </h1>
        <p className="text-2xl font-semibold text-gray-800 mb-2">Lỗi!</p>
        <p className="text-gray-600 mb-6">{defaultMessage}</p>

        {defaultStatus === 401 ? (
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-md hover:bg-teal-600 transition-colors duration-300 ease-in-out"
          >
            Vui lòng đăng nhập
          </Link>
        ) : (
          <Link
            to={role === "admin" ? "/admin" : "/"}
            className="inline-block px-6 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-md hover:bg-teal-600 transition-colors duration-300 ease-in-out"
          >
            Quay về trang chủ
          </Link>
        )}
      </div>
    </div>
  );
}

export default ErrorPage;
