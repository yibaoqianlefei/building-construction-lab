import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error: err } = await signIn(email, password);
        if (err) {
          const msg = err.message;
          if (msg.includes("Invalid login") || msg.includes("invalid")) {
            setError("邮箱或密码错误，请重试");
          } else if (msg.includes("Email not confirmed")) {
            setError("邮箱尚未验证，请检查收件箱或关闭邮箱验证（见下方提示）");
          } else {
            setError(msg);
          }
        }
      } else {
        const { error: err } = await signUp(email, password, fullName, role);
        if (err) {
          setError(err.message);
        } else {
          setError("");
          setIsLogin(true);
          setPassword("");
        }
      }
    } catch (err) {
      setError("无法连接服务器，请检查 Supabase 配置");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-gray-800 tracking-tight">
            建筑构造交互系统
          </Link>
          <p className="text-gray-400 text-sm mt-2">
            {isLogin ? "欢迎回来" : "创建新账号"}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8
          border border-gray-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isLogin
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isLogin
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="姓名"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                      text-sm text-gray-700 placeholder-gray-400
                      focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200
                      transition-colors bg-white/80"
                  />
                </div>

                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                      text-sm text-gray-700 bg-white/80
                      focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200
                      transition-colors appearance-none cursor-pointer"
                  >
                    <option value="student">学生</option>
                    <option value="teacher">教师</option>
                  </select>
                </div>
              </>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                  text-sm text-gray-700 placeholder-gray-400
                  focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200
                  transition-colors bg-white/80"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                  text-sm text-gray-700 placeholder-gray-400
                  focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200
                  transition-colors bg-white/80"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium
                hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "请稍候..." : isLogin ? "登录" : "注册"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;
