import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, User, LogOut, GraduationCap, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const isHome = pathname === "/";
  const isAuth = pathname === "/auth";
  const [canGoBack, setCanGoBack] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleBack() {
    navigate(-1);
  }

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
  }

  return (
    <>
      {!isHome && !isAuth && (
        <nav
          className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 md:px-10
            bg-canvas border-b border-hairline"
        >
          <div className="flex items-center gap-2">
            {canGoBack && (
              <>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 cursor-pointer
                    text-muted hover:text-primary
                    transition-colors duration-200
                    hover:bg-surface-card rounded-lg px-2 py-1 -ml-2"
                  title="返回上一页"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                  <span className="text-sm font-medium">返回</span>
                </button>
                <span className="text-muted-soft select-none">|</span>
              </>
            )}
            <Link
              to="/"
              className="text-sm font-medium text-muted tracking-tight hover:text-primary transition-colors"
            >
              建筑构造交互系统
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                    text-sm text-body hover:bg-surface-card transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-hairline flex items-center justify-center">
                    <User size={13} className="text-primary" />
                  </div>
                  <span className="hidden sm:inline font-medium">
                    {profile?.full_name || user.email}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-hairline text-primary font-medium">
                    {profile?.role === "developer" ? "开发者" : "用户"}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-canvas
                    rounded-xl border border-hairline shadow-[0_1px_3px_rgba(20,20,19,0.08)] py-1 z-50">
                    {profile && profile.role === "developer" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-body
                          hover:bg-surface-card transition-colors"
                      >
                        <Settings size={15} />
                        管理后台
                      </Link>
                    )}
                    <hr className="my-1 border-hairline" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-muted
                        hover:bg-surface-card transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut size={15} />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium
                  bg-primary text-on-primary hover:bg-primary-active transition-colors cursor-pointer"
              >
                登录
              </Link>
            )}
          </div>
        </nav>
      )}
      <Outlet />
    </>
  );
}

export default AppLayout;
