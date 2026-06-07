import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  Layers,
  Hammer,
  BookOpen,
  Info,
  GitPullRequest,
  X,
  LogIn,
  LogOut,
  SwitchCamera,
  Pause,
  Play,
  Briefcase,
  GraduationCap,
  Sparkles,
  BarChart3,
} from "lucide-react";
import MenuBackground from "../components/viewer/MenuBackground";
import LoadingOverlay from "../components/viewer/LoadingOverlay";

import backgroundScenes from "../data/backgroundScenes";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

const titleContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const charVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] },
  },
};

const lineVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.4 },
  },
};

function MenuItem({ item, onClick }) {
  const disabled = item.disabled;

  const content = (
    <>
      <item.icon size={18} strokeWidth={1.5}
        className={`flex-shrink-0 ${disabled ? "text-black/15" : "text-muted-soft"}`} />
      <span className={`text-[18px] font-medium ${disabled ? "text-black/15" : "text-muted"}`}>
        {item.label}
      </span>
      {disabled && (
        <span className="ml-auto text-[10px] text-muted-soft/40 font-normal">即将上线</span>
      )}
    </>
  );

  const baseClass =
    "w-full flex items-center gap-[10px] pl-[12px] h-[38px] rounded-[10px]" +
    " transition-all duration-300 ease-out" +
    (disabled
      ? " cursor-not-allowed"
      : " hover:bg-white/60 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] cursor-pointer group text-left");

  if (disabled) {
    return <div className={baseClass}>{content}</div>;
  }

  if (onClick) {
    return <button onClick={onClick} className={baseClass}>{content}</button>;
  }

  return <Link to={item.to} className={baseClass}>{content}</Link>;
}

function MenuContent({ onModalOpen, onOpenChat }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSwitchAccount() {
    await signOut();
    navigate("/auth");
  }

  const menuGroups = [
    {
      title: "教学资源",
      items: [
        { icon: BookOpen, label: "原理支持", to: "/curriculum" },
        { icon: Layers, label: "节点库", to: "/library" },
        { icon: Briefcase, label: "案例应用", to: "/curriculum/cases" },
      ],
    },
    {
      title: "学生实践",
      items: [
        { icon: GraduationCap, label: "自主学习", to: "/textbook/roof-membrane" },
        { icon: Hammer, label: "作业训练", to: "/games" },
      ],
    },
    {
      title: "AI 与评价",
      items: [
        { icon: Sparkles, label: "AI 助手", onClick: onOpenChat },
        { icon: BarChart3, label: "评价分析", disabled: true },
      ],
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col h-full pt-16 pb-20">
      {/* ── Header ── */}
      <div className="flex-shrink-0">
        <motion.h1
          className="text-[38px] font-normal font-serif tracking-tight text-ink"
          variants={titleContainerVariants}>
          {"建筑构造".split("").map((ch, i) => (
            <motion.span key={i} variants={charVariants} className="inline-block">{ch}</motion.span>
          ))}
        </motion.h1>
        <motion.div
          className="w-12 h-0.5 bg-primary rounded-full mt-6"
          variants={lineVariants} />
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 mt-6">
        {menuGroups.map((group, gi) => (
          <motion.div key={group.title} variants={itemVariants} className="mb-7">
            <p className="text-[12px] font-medium tracking-[0.08em] text-[#9b948b] mb-[12px]">
              {group.title}
            </p>
            {group.items.map((item) => (
              <MenuItem key={item.label} item={item} onClick={item.onClick} />
            ))}
            {gi < menuGroups.length - 1 && (
              <div className="border-t border-gray-200/50 mt-3" />
            )}
          </motion.div>
        ))}
      </div>


      {/* ── Footer ── */}
      <div className="flex-shrink-0 mt-auto">
        {user ? (
          <div>
            <div className="flex items-center gap-3">
              <div className="w-[44px] h-[44px] rounded-full bg-hairline flex items-center justify-center text-primary text-base font-semibold flex-shrink-0">
                {(profile?.full_name || user.email || "?")[0]}
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-medium text-black/80 truncate">{profile?.full_name || user.email}</p>
                <p className="text-[13px] text-black/40">{profile?.role === "developer" ? "开发者" : "用户"}</p>
              </div>
            </div>
            <button onClick={handleSwitchAccount}
              className="w-full flex items-center gap-3.5 pl-[12px] h-[40px] rounded-[10px]
                transition-all duration-300 ease-out hover:bg-surface-card cursor-pointer mt-3">
              <SwitchCamera size={18} strokeWidth={1.5} className="text-muted-soft flex-shrink-0" />
              <span className="text-[14px] text-muted">切换账号</span>
            </button>
            <button onClick={() => signOut()}
              className="w-full flex items-center gap-3.5 pl-[12px] h-[40px] rounded-[10px]
                transition-all duration-300 ease-out hover:bg-surface-card cursor-pointer">
              <LogOut size={18} strokeWidth={1.5} className="text-muted-soft flex-shrink-0" />
              <span className="text-[14px] text-muted-soft">退出登录</span>
            </button>
          </div>
        ) : (
          <MenuItem item={{ icon: LogIn, label: "登录 / 注册", to: "/auth" }} />
        )}
      </div>

      <motion.p className="text-xs text-muted-soft mt-4 tracking-wide" variants={itemVariants}>
        探索建筑构造的空间逻辑
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
            className="absolute inset-0 bg-black/20"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-canvas rounded-xl border border-hairline
              shadow-[0_1px_3px_rgba(20,20,19,0.08)] p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full
                flex items-center justify-center
                bg-surface-card hover:bg-surface-cream-strong text-muted-soft hover:text-body
                transition-colors"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-normal font-serif text-ink tracking-tight mb-3">
              关于项目
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-5">
              建筑构造交互系统是一个面向建筑学教育的开源工具，通过三维可视化
              和交互式分解视图，帮助学生和从业者直观理解建筑构造的空间逻辑。
            </p>
            <div className="space-y-2.5 text-sm text-muted">
              <div className="flex justify-between">
                <span className="text-muted-soft">版本</span>
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
                  className="text-primary hover:text-primary-active underline underline-offset-2 transition-colors"
                >
                  项目地址（待添加）
                </a>
              </div>
            </div>

            <div className="mt-7 pt-5 border-t border-hairline text-center text-xs text-muted-soft">
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
  const [autoRotate, setAutoRotate] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [bgLoading, setBgLoading] = useState(true);
  const currentScene = backgroundScenes[sceneIndex];

  useEffect(() => {
    setBgLoading(true);
  }, [sceneIndex]);

  /* preload background models */
  useEffect(() => {
    const paths = backgroundScenes.map((s) => s.modelPath).filter(Boolean);
    paths.forEach((p) => useGLTF.preload(p, true));
  }, []);

  const handleBgLoaded = useCallback(() => setBgLoading(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <aside
        className="hidden md:flex w-96 flex-shrink-0
          bg-canvas border-r border-hairline
          flex-col h-full px-10"
      >
        <MenuContent onModalOpen={() => setModalOpen(true)} onOpenChat={() => {}} />
      </aside>

      <div className="hidden md:block flex-1 h-full relative">
        {/* ── top nav bar ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-end items-center
          h-10 px-4 bg-white/60 backdrop-blur-md border-b border-white/20">
          <Link to="/contribute"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary
              transition-colors px-2 py-1 rounded-md hover:bg-surface-card">
            <GitPullRequest size={14} strokeWidth={1.5} />
            <span>贡献节点</span>
          </Link>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary
              transition-colors px-2 py-1 rounded-md hover:bg-surface-card ml-1">
            <Info size={14} strokeWidth={1.5} />
            <span>关于项目</span>
          </button>
        </div>

        <Canvas
          camera={{ near: 1, far: 100, position: [0, 0.5, 4.0], fov: 40 }}
          dpr={[1, 1.5]}
          shadows
          gl={{ antialias: true, alpha: false }}
        >
          <MenuBackground
            key={sceneIndex}
            autoRotate={autoRotate}
            modelPath={currentScene.modelPath}
            position={currentScene.position}
            onLoaded={handleBgLoaded}
          />
        </Canvas>
        {/* loading overlay */}
        <LoadingOverlay isLoading={bgLoading} />
        {/* bottom-right control buttons */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
          {/* scene switcher */}
          <button
            onClick={() => setSceneIndex((prev) => (prev + 1) % backgroundScenes.length)}
            className="w-11 h-11 rounded-full bg-canvas border border-hairline flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-surface-card"
            title={`场景: ${currentScene.name} (点击切换)`}
          >
            <SwitchCamera size={17} className="text-muted-soft hover:text-primary" />
          </button>
          {/* auto-rotate toggle */}
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className="w-11 h-11 rounded-full bg-canvas border border-hairline flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-surface-card"
            title={autoRotate ? "暂停旋转" : "恢复旋转"}
          >
            {autoRotate ? (
              <Pause size={17} className="text-primary" />
            ) : (
              <Play size={17} className="text-muted-soft hover:text-primary" />
            )}
          </button>
        </div>
      </div>

      <div
        className="flex md:hidden w-full h-full
          bg-canvas
          flex-col justify-center px-8"
      >
        <MenuContent onModalOpen={() => setModalOpen(true)} onOpenChat={() => {}} />
      </div>

      <AboutModal open={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  );
}

export default HomePage;
