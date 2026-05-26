import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Copy, X, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getMyClasses, createClass, joinClass } from "../services/classService";

function CreateClassModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      const cls = await createClass(name.trim());
      setCode(cls.join_code);
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setName("");
    setCode(null);
    setError("");
    onClose();
  }

  function copyCode() {
    if (code) navigator.clipboard.writeText(code);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/15 backdrop-blur-md" onClick={handleClose} />
          <motion.div
            className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200/50 p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <button onClick={handleClose} className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>

            {code ? (
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">班级已创建</h2>
                <p className="text-gray-500 text-sm mb-5">将此加入码发送给学生</p>
                <div className="bg-rose-50 rounded-2xl py-5 px-4 mb-4">
                  <p className="text-4xl font-mono font-bold text-rose-600 tracking-widest select-all">{code}</p>
                </div>
                <button onClick={copyCode} className="flex items-center gap-1.5 mx-auto text-sm text-rose-600 hover:text-rose-700 transition-colors cursor-pointer">
                  <Copy size={14} /> 复制加入码
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">创建班级</h2>
                <input
                  type="text" placeholder="班级名称" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition-colors bg-white/80 mb-3"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                <button onClick={handleCreate} disabled={loading || !name.trim()}
                  className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer">
                  {loading ? "创建中..." : "创建"}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function JoinClassModal({ open, onClose, onJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!code.trim()) return;
    setError("");
    setLoading(true);
    try {
      await joinClass(code.trim());
      onJoined();
      handleClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() { setCode(""); setError(""); onClose(); }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/15 backdrop-blur-md" onClick={handleClose} />
          <motion.div
            className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200/50 p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <button onClick={handleClose} className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">加入班级</h2>
            <input
              type="text" placeholder="输入加入码" value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition-colors bg-white/80 mb-3 font-mono"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button onClick={handleJoin} disabled={loading || !code.trim()}
              className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer">
              {loading ? "加入中..." : "加入"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ClassesPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const fetchClasses = useCallback(async () => {
    try { setClasses(await getMyClasses()); } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">
        <div className="flex items-center justify-between mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">我的班级</h1>
            <p className="text-gray-500 text-sm mt-1.5">
              {profile?.role === "teacher" ? "管理您的教学班级" : "您已加入的班级"}
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            <button onClick={() => setJoinOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-500 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors cursor-pointer">
              <UserPlus size={16} />
              加入班级
            </button>
            {profile?.role === "teacher" && (
              <button onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors cursor-pointer">
                <Plus size={16} />
                创建班级
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Users size={40} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-gray-500">暂无班级</p>
            <p className="text-gray-400 text-sm mt-1">创建一个班级或输入加入码加入</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                onClick={() => navigate(`/classes/${cls.id}`)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6
                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                  hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_8px_20px_rgba(255,61,88,0.08)]
                  hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
                  <Users size={20} className="text-rose-600" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cls.teacher_name}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>{cls.member_count} 位成员</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium">
                    {cls.role === "teacher" ? "教师" : "学生"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateClassModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchClasses} />
      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoined={fetchClasses} />
    </div>
  );
}

export default ClassesPage;
