import { Outlet, useLocation, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

function AppLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <>
      {!isHome && (
        <nav
          className="sticky top-0 z-30 flex items-center h-16 px-6 md:px-10
            bg-white/70 backdrop-blur-md border-b border-gray-200/50
            shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-apple-500 hover:text-apple-600 transition-colors"
              title="返回主菜单"
            >
              <FiArrowLeft size={18} />
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-gray-500 tracking-tight hover:text-apple-500 transition-colors"
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
