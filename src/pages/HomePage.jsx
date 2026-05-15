import { useState } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Layers,
  Wrench,
  BookOpen,
  Info,
  GitPullRequest,
  X,
} from "lucide-react";
import MenuBackground from "../components/viewer/MenuBackground";

const menuItems = [
  { icon: Compass, label: "开始探索", to: "/curriculum" },
  { icon: Layers, label: "节点库", to: "/library" },
  { icon: Wrench, label: "构造工具", to: "/tools" },
  { icon: BookOpen, label: "我的笔记", to: "/notes" },
  { icon: GitPullRequest, label: "贡献节点", to: "/contribute" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

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
    <div className="relative w-full h-screen overflow-hidden bg-[#f8f9fa]">
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [1.2, 1.6, 3.2], fov: 38 }}
          shadows
          gl={{ antialias: true }}
        >
          <MenuBackground />
        </Canvas>
      </div>

      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center px-5 md:px-8 py-3">
        <Link
          to="/"
          className="text-sm font-medium text-gray-500 tracking-wider hover:text-academic-500 transition-colors"
        >
          建筑构造交互系统
        </Link>
      </nav>

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <motion.div
          className="pointer-events-auto"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-wide">
              建筑构造交互系统
            </h1>
            <div className="w-16 h-0.5 bg-academic-600 mx-auto my-4" />
          </div>

          <div className="space-y-3 md:space-y-4">
            {menuItems.map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <Link
                  to={item.to}
                  className="flex items-center gap-4 px-8 py-4
                    bg-white/70 backdrop-blur-md
                    border border-white/50 rounded-2xl
                    shadow-lg shadow-black/5
                    transition-all duration-300
                    hover:shadow-xl hover:-translate-y-1 hover:bg-white/80
                    hover:border-l-4 hover:border-l-academic-600 hover:border-l-[4px]
                    group"
                >
                  <item.icon
                    size={24}
                    className="text-gray-500 group-hover:text-academic-600 transition-colors flex-shrink-0"
                    strokeWidth={1.8}
                  />
                  <span className="text-lg font-medium text-gray-700 group-hover:text-academic-700 transition-colors">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}

            <motion.div variants={itemVariants}>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center gap-4 px-8 py-4
                  bg-white/70 backdrop-blur-md
                  border border-white/50 rounded-2xl
                  shadow-lg shadow-black/5
                  transition-all duration-300
                  hover:shadow-xl hover:-translate-y-1 hover:bg-white/80
                  hover:border-l-4 hover:border-l-academic-600 hover:border-l-[4px]
                  group cursor-pointer"
              >
                <Info
                  size={24}
                  className="text-gray-500 group-hover:text-academic-600 transition-colors flex-shrink-0"
                  strokeWidth={1.8}
                />
                <span className="text-lg font-medium text-gray-700 group-hover:text-academic-700 transition-colors">
                  关于项目
                </span>
              </button>
            </motion.div>
          </div>

          <motion.p
            className="text-xs text-gray-400 mt-8 text-center"
            variants={itemVariants}
          >
            开源教育工具 · 探索建筑构造的空间逻辑
          </motion.p>
        </motion.div>
      </div>

      <AboutModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default HomePage;
