import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, BookOpen, ClipboardList } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getClassDetail } from "../services/classService";
import CurriculumPage from "../pages/CurriculumPage";

const TABS = [
  { key: "curriculum", label: "课程", icon: BookOpen },
  { key: "assignments", label: "任务", icon: ClipboardList },
  { key: "members", label: "成员", icon: Users },
];

function ClassDetailPage() {
  const { classId } = useParams();
  const { profile } = useAuth();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("curriculum");

  useEffect(() => {
    getClassDetail(classId).then(setCls).catch(console.error).finally(() => setLoading(false));
  }, [classId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">班级未找到</p>
      </div>
    );
  }

  const isTeacher = profile?.role === "teacher";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <motion.div
        className="max-w-5xl mx-auto w-full px-6 md:px-10 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-2">
          <Link to="/classes" className="text-sm text-rose-600 hover:text-rose-700 transition-colors">
            ← 返回班级列表
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{cls.name}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {cls.teacher_name} · {cls.members?.length || 0} 位成员 · 加入码 <span className="font-mono text-rose-600">{cls.join_code}</span>
            </p>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {TABS.filter(t => t.key !== "members" || isTeacher).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                tab === t.key
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon size={15} strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>

        {/* tab content */}
        {tab === "curriculum" && (
          <div className="min-h-[400px]">
            <CurriculumPageInner />
          </div>
        )}

        {tab === "assignments" && (
          <div className="text-center py-20">
            <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-gray-500">暂无任务</p>
            {isTeacher && <p className="text-gray-400 text-sm mt-1">布置任务功能即将上线</p>}
          </div>
        )}

        {tab === "members" && isTeacher && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">班级成员</h2>
            <div className="space-y-2">
              {cls.members?.map((m, i) => (
                <motion.div
                  key={m.student_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-semibold">
                    {(m.profiles?.full_name || "?")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.profiles?.full_name || "未知"}</p>
                    <p className="text-xs text-gray-400">
                      加入于 {new Date(m.joined_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ClassDetailPage;
