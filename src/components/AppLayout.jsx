import { Outlet, useLocation, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

function AppLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <>
      {!isHome && (
        <nav className="flex items-center px-5 md:px-8 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="text-academic-500 hover:text-academic-600 transition-colors"
              title="返回主菜单"
            >
              <FiArrowLeft size={18} />
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-gray-500 tracking-wider hover:text-academic-500 transition-colors"
            >
              建筑构造交互系统
            </Link>
          </div>
        </nav>
      )}
      <Outlet />
    </>
  );
}

export default AppLayout;
