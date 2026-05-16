import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import courseModules from "../data/courseModules";
import { nodesIndex } from "../data/nodesIndex";

function NodeCard({ node, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        to={`/node/${node.id}`}
        className="block bg-white/80 backdrop-blur-sm border border-gray-200/60
          rounded-2xl p-6
          shadow-[0_2px_8px_rgba(0,0,0,0.04)]
          hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_8px_20px_rgba(212,164,58,0.08)]
          hover:-translate-y-1.5 hover:scale-[1.01]
          hover:bg-white hover:border-gold-200
          transition-all duration-300 ease-out
          cursor-pointer group"
      >
        <div className="w-full h-20 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-3xl">
          🧱
        </div>

        <h3 className="text-base font-semibold text-gray-900 group-hover:text-gold-600 transition-colors tracking-tight">
          {node.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
          {node.description}
        </p>

        <div className="mt-3 flex items-center gap-1 text-xs text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          进入节点
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

function ModuleGrid({ onSelectModule }) {
  return (
    <motion.div
      key="grid"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          课程目录
        </h1>
        <p className="mt-2 text-gray-500 text-base">
          选择要学习的构造模块
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courseModules.map((mod, i) => {
          const nodeCount = mod.nodeIds.filter((id) =>
            nodesIndex.some((n) => n.id === id)
          ).length;

          if (mod.available) {
            return (
              <motion.button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60
                  rounded-3xl p-8
                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                  hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_20px_rgba(212,164,58,0.1)]
                  hover:-translate-y-2 hover:scale-[1.02]
                  hover:bg-white hover:border-gold-200
                  transition-all duration-300 ease-out cursor-pointer
                  text-left group"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
              >
                <span className="text-4xl transition-transform duration-300 ease-out group-hover:scale-110 inline-block">{mod.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-5 group-hover:text-gold-600 transition-colors tracking-tight">
                  {mod.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {mod.description}
                </p>
                <span className="inline-block mt-4 text-xs font-medium text-gold-600 bg-gold-50 px-3 py-1 rounded-full">
                  {nodeCount} 个节点
                </span>
              </motion.button>
            );
          }

          return (
            <motion.div
              key={mod.id}
              className="bg-gray-50/80 border border-gray-100 rounded-3xl p-8
                opacity-50 cursor-default text-left"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            >
              <span className="text-4xl grayscale">{mod.icon}</span>
              <h3 className="text-xl font-bold text-gray-400 mt-5 tracking-tight">
                {mod.title}
              </h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                {mod.description}
              </p>
              <span className="inline-block mt-4 text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                即将上线
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ModuleDetail({ module }) {
  const moduleNodes = module.nodeIds
    .map((id) => {
      const node = nodesIndex.find((n) => n.id === id);
      if (!node) {
        console.warn(
          `课程模块 "${module.title}": 节点 "${id}" 未在 nodesIndex 中找到`
        );
      }
      return node;
    })
    .filter(Boolean);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mb-2">
        <span className="text-sm text-gray-400">
          <Link
            to="/curriculum"
            className="text-gold-600 hover:text-gold-700 transition-colors"
          >
            课程目录
          </Link>
          <span className="mx-1.5 text-gray-300">›</span>
          <span className="text-gray-500">{module.title}</span>
        </span>
      </div>

      <div className="mb-8 mt-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {module.title}
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">{module.description}</p>
      </div>

      {moduleNodes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-base">暂无节点</p>
          <p className="text-xs mt-1.5">该模块的构造节点正在建设中</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {moduleNodes.map((node, i) => (
            <NodeCard key={node.id} node={node} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CurriculumPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleId = searchParams.get("module");

  const selectedModule = moduleId
    ? courseModules.find((m) => m.id === moduleId && m.available)
    : null;

  function handleSelectModule(id) {
    setSearchParams({ module: id });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 md:px-10 py-10 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {selectedModule ? (
            <ModuleDetail module={selectedModule} />
          ) : (
            <ModuleGrid onSelectModule={handleSelectModule} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default CurriculumPage;
