import { Link, Outlet } from "react-router-dom";
import clsx from "clsx";
import "./CustomerLayout.scss"; 
import CustomerFooter from "../../components/customer/CustomerFooter";
import { useState } from "react";
import { ACTIVE_PAGES } from "../../constants/pageContants"; 

function CustomerLayout(props) {
  const { user } = props;

  const [activePage, setActivePage] = useState(ACTIVE_PAGES.home);
  const handleActivePage = (page) => {
    setActivePage(page);
  };

  const navItemClasses = clsx(
    "layout-customer__nav--item rounded-lg transition duration-300 ease-in-out",
    "hover:bg-white/20 hover:border-b-2 hover:font-semibold hover:border-white"
  );
  const activeNavItemClasses = clsx(
    " bg-white/20 border-b-2 font-semibold border-white"
  );

  return (
    <div className="layout-customer flex flex-col items-stretch min-h-screen">
      <header className="layout-customer__header fixed w-full bg-cyan-400 h-16 z-10 ">
        <div className="layout-customer__nav container bg-inherit p-2 h-full flex mx-auto  justify-start items-center gap-x-4 shadow-cyan-300">
          <div className="layout-customer__nav--logo rounded-lg ">
            <Link to="/">
              <div className="flex flex-row p-2 bg-inherit justify-start items-center gap-2">
                <div className="flex-shrink-0">
                  <img
                    src={"/logo192.png"}
                    className="h-10 w-10 object-cover"
                    alt="Logo"
                  />
                </div>
                <div>
                  <p className="p-2">My Shop</p>
                </div>
              </div>
            </Link>
          </div>
          <div
            onClick={() => handleActivePage(ACTIVE_PAGES.products)}
            className={
              navItemClasses +
              (activePage === ACTIVE_PAGES.products ? activeNavItemClasses : "")
            }
          >
            <Link to="products">
              <p className="p-2">Sản phẩm</p>
            </Link>
          </div>
          <div
            onClick={() => handleActivePage(ACTIVE_PAGES.cart)}
            className={
              navItemClasses +
              (activePage === ACTIVE_PAGES.cart ? activeNavItemClasses : "")
            }
          >
            <Link to="cart">
              <p className="p-2">Giỏ hàng</p>
            </Link>
          </div>

          <div className={navItemClasses + " ml-auto"}>
            <Link to="/login">
              <p className="p-2">Đăng nhập</p>
            </Link>
          </div>

          <div
            onClick={() => handleActivePage(ACTIVE_PAGES.profile)}
            className={
              navItemClasses +
              (activePage === ACTIVE_PAGES.profile ? activeNavItemClasses : "")
            }
          >
            <Link to="/profile">
              <p className="p-2">Chào {user.username}!</p>
            </Link>
          </div>
        </div>
      </header>

      <main className="layout-customer__main container mx-auto min-h-96 bg-teal-200">
        <Outlet context={{ props }} />
      </main>

      <footer className="layout-customer__footer  bg-gray-200">
        <CustomerFooter />
      </footer>
    </div>
  );
}

export default CustomerLayout;
