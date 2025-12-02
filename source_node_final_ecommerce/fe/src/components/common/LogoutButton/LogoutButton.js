import { LogoutOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const LogoutButton = ({ className, styles, text }) => {
  const fixedClass = 'bg-red-400 cursor-pointer text-white flex items-center justify-center py-2 mx-4 rounded-lg'
  const baseClass = `absolute bottom-0 left-0 right-0 mb-3`;
  const baseStyles = {};
  console.log('LogoutButton rendered', fixedClass + (className ? ` ${className}` : ` ${baseClass}`));
  return (
    <>
      {/* logout button */}
      <div
        className={fixedClass + (className ? ` ${className}` : ` ${baseClass}`)}
        style={{ ...baseStyles, ...styles }}
      >
        <Link to="/logout" className="flex items-center gap-2">
          <LogoutOutlined />
          {text || 'Đăng xuất'}
        </Link>
      </div>
    </>
  );
};
export default LogoutButton;
