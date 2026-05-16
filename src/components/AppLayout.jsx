import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  function handleBack() {
    navigate(-1);
  }

  return (
    <>
      {!isHome && (
        <nav
          className="sticky top-0 z-30 flex items-center h-16 px-6 md:px-10
            bg-white/70 backdrop-blur-md border-b border-gray-200/50
            shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-2">
            {canGoBack && (
              <>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 cursor-pointer
                    text-gray-500 hover:text-gold-600
                    transition-colors duration-200
                    hover:bg-gray-100 rounded-lg px-2 py-1 -ml-2"
                  title="返回上一页"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                  <span className="text-sm font-medium">返回</span>
                </button>

                <span className="text-gray-300 select-none">|</span>
              </>
            )}

            <Link
              to="/"
              className="text-sm font-medium text-gray-500 tracking-tight hover:text-gold-600 transition-colors"
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
