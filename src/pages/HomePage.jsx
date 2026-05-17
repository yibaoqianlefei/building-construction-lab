import { useState } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  Layers,
  Wrench,
  BookOpen,
  Info,
  GitPullRequest,
  X,
  LogIn,
  LogOut,
  Users,
} from "lucide-react";
import MenuBackground from "../components/viewer/MenuBackground";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { icon: Library, label: "课程目录", to: "/curriculum" },
  { icon: Layers, label: "节点库", to: "/library" },
  { icon: Wrench, label: "构造工具", to: "/tools" },
  { icon: BookOpen, label: "我的笔记", to: "/notes" },
  { icon: GitPullRequest, label: "贡献节点", to: "/contribute" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

function MenuItem({ item, onClick }) {
  const content = (
    <>
      <item.icon
        size={22}
        strokeWidth={1.5}
        className="text-gray-400 group-hover:text-gold-600 transition-all duration-300 ease-out flex-shrink-0"
      />
      <span className="text-base font-medium text-gray-600 group-hover:text-gray-900 transition-all duration-300 ease-out">
        {item.label}
      </span>
    </>
  );

  const baseClass =
    "w-full flex items-center gap-3.5 px-5 py-3 rounded-xl" +
    " border-l-4 border-transparent hover:border-l-gold-500" +
    " transition-all duration-300 ease-out" +
    " hover:bg-gold-50/70 hover:backdrop-blur-sm" +
    " hover:-translate-y-0.5" +
    " hover:shadow-[0_4px_12px_rgba(212,164,58,0.12)]" +
    " cursor-pointer group text-left";

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClass}>
        {content}
      </button>
    );
  }

  return (
    <Link to={item.to} className={baseClass}>
      {content}
    </Link>
  );
}

function MenuContent({ onModalOpen }) {
  const { user, profile, signOut } = useAuth();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h1
        className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5"
        variants={itemVariants}
      >
        建筑构造交互系统
      </motion.h1>
      <motion.div
        className="w-10 h-0.5 bg-gold-500 rounded-full my-5"
        variants={itemVariants}
      />

      <motion.div className="space-y-0.5" variants={itemVariants}>
        {menuItems.map((item) => (
          <MenuItem key={item.label} item={item} />
        ))}

        <MenuItem
          item={{ icon: Info, label: "关于项目" }}
          onClick={onModalOpen}
        />
      </motion.div>

      {/* ── auth section ── */}
      <motion.div variants={itemVariants}>
        <div className="border-t border-gray-200/50 my-5" />

        {user ? (
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 px-5 py-2">
              <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 text-sm font-semibold flex-shrink-0">
                {(profile?.full_name || user.email || "?")[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {profile?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-400">
                  {profile?.role === "teacher" ? "教师" : "学生"}
                </p>
              </div>
            </div>

            <MenuItem
              item={{ icon: Users, label: "我的班级", to: "/classes" }}
            />

            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3.5 px-5 py-3 rounded-xl
                border-l-4 border-transparent
                transition-all duration-300 ease-out
                hover:bg-red-50/50
                cursor-pointer group text-left mt-0.5"
            >
              <LogOut
                size={22}
                strokeWidth={1.5}
                className="text-gray-400 group-hover:text-red-400 transition-all duration-300 ease-out flex-shrink-0"
              />
              <span className="text-base font-medium text-gray-400 group-hover:text-red-400 transition-all duration-300 ease-out">
                退出登录
              </span>
            </button>
          </div>
        ) : (
          <MenuItem
            item={{ icon: LogIn, label: "登录 / 注册", to: "/auth" }}
          />
        )}
      </motion.div>

      <motion.p
        className="text-xs text-gray-400 mt-8 tracking-wide"
        variants={itemVariants}
      >
        开源教育工具 · 探索建筑构造的空间逻辑
      </motion.p>
    </motion.div>
  );
}

function AboutModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/15 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]
              border border-gray-200/50 p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full
                flex items-center justify-center
                bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600
                transition-colors"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-3">
              关于项目
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              建筑构造交互系统是一个面向建筑学教育的开源工具，通过三维可视化
              和交互式分解视图，帮助学生和从业者直观理解建筑构造的空间逻辑。
            </p>
            <div className="space-y-2.5 text-sm text-gray-500">
              <div className="flex justify-between">
                <span className="text-gray-400">版本</span>
                <span className="tabular-nums">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">许可协议</span>
                <span>MIT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">GitHub</span>
                <a
                  href="#"
                  className="text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors"
                >
                  项目地址（待添加）
                </a>
              </div>
            </div>

            <div className="mt-7 pt-5 border-t border-gray-100 text-center text-xs text-gray-400">
              开源教育工具 · 探索建筑构造的空间逻辑
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
      <aside
        className="hidden md:flex w-96 flex-shrink-0
          bg-white/60 backdrop-blur-xl border-r border-gray-200/50
          flex-col justify-center h-full px-10"
      >
        <MenuContent onModalOpen={() => setModalOpen(true)} />
      </aside>

      <div className="hidden md:block flex-1 h-full">
        <Canvas
          camera={{ near: 1, far: 100, position: [1.6, 1.8, 3.6], fov: 36 }}
          shadows
          gl={{ antialias: true, alpha: false }}
        >
          <MenuBackground />
        </Canvas>
      </div>

      <div
        className="flex md:hidden w-full h-full
          bg-gradient-to-b from-gray-50 to-white
          flex-col justify-center px-8"
      >
        <MenuContent onModalOpen={() => setModalOpen(true)} />
      </div>

      <AboutModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default HomePage;
