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
} from "lucide-react";
import MenuBackground from "../components/viewer/MenuBackground";

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
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function MenuItem({ item, onClick }) {
  const content = (
    <>
      <item.icon
        size={22}
        strokeWidth={1.8}
        className="text-gray-500 group-hover:text-academic-600 transition-colors flex-shrink-0"
      />
      <span className="text-lg font-medium text-gray-700 group-hover:text-academic-700 transition-colors">
        {item.label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
          border-l-4 border-transparent hover:border-l-academic-600
          transition-all duration-300 hover:bg-academic-50 cursor-pointer
          group text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={item.to}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl
        border-l-4 border-transparent hover:border-l-academic-600
        transition-all duration-300 hover:bg-academic-50
        group"
    >
      {content}
    </Link>
  );
}

function MenuContent({ onModalOpen }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h1
        className="text-3xl font-bold text-gray-800 mb-2"
        variants={itemVariants}
      >
        建筑构造交互系统
      </motion.h1>
      <motion.div
        className="w-12 h-0.5 bg-academic-600 my-4"
        variants={itemVariants}
      />

      <motion.div className="space-y-1.5" variants={itemVariants}>
        {menuItems.map((item) => (
          <MenuItem key={item.label} item={item} />
        ))}

        <MenuItem
          item={{ icon: Info, label: "关于项目" }}
          onClick={onModalOpen}
        />
      </motion.div>

      <motion.p className="text-xs text-gray-400 mt-8" variants={itemVariants}>
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
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              关于项目
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              建筑构造交互系统是一个面向建筑学教育的开源工具，通过三维可视化
              和交互式分解视图，帮助学生和从业者直观理解建筑构造的空间逻辑。
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span className="text-gray-400">版本</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">许可协议</span>
                <span>MIT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">GitHub</span>
                <a
                  href="#"
                  className="text-academic-500 hover:text-academic-600 underline underline-offset-2"
                >
                  项目地址（待添加）
                </a>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
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
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      <aside
        className="hidden md:flex w-80 lg:w-[340px] flex-shrink-0
          bg-white/80 backdrop-blur-md border-r border-gray-100
          flex-col justify-center h-full px-8"
      >
        <MenuContent onModalOpen={() => setModalOpen(true)} />
      </aside>

      <div className="hidden md:block flex-1 h-full">
        <Canvas
          camera={{ position: [1.4, 1.8, 3.4], fov: 38 }}
          shadows
          gl={{ antialias: true }}
        >
          <MenuBackground />
        </Canvas>
      </div>

      <div
        className="flex md:hidden w-full h-full
          bg-gradient-to-b from-gray-50 to-white
          flex-col justify-center px-6"
      >
        <MenuContent onModalOpen={() => setModalOpen(true)} />
      </div>

      <AboutModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default HomePage;
