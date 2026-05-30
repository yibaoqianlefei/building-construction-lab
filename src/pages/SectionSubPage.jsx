import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import courseModules from "../data/courseModules";

const sectionsMap = {
  introduction: () => import("../data/sections/introSections"),
  structures: () => import("../data/sections/structureSections"),
  foundation: () => import("../data/sections/foundationSections"),
  wall: () => import("../data/sections/wallSections"),
  floor: () => import("../data/sections/floorSections"),
  stairs: () => import("../data/sections/stairsSections"),
  "door-window": () => import("../data/sections/windowSections"),
  roof: () => import("../data/sections/roofSections"),
  cases: () => import("../data/sections/caseSections"),
};

function SectionCard({ sec, index, onClick }) {
  const hasChildren = sec.children && sec.children.length > 0;
  const nodeCount = (sec.nodeIds || []).length;
  const linkTarget =
    sec.to ||
    (sec.hasTextbook ? `/textbook/${sec.id}` : null) ||
    (nodeCount > 0 ? `/node/${sec.nodeIds[0]}` : null);

  /* clickable: has children, or available with a real target */
  const isClickable = hasChildren || (sec.available && linkTarget);

  const content = (
    <>
      <span className="text-4xl transition-transform duration-300 ease-out group-hover:scale-110 inline-block">
        {sec.icon || "📄"}
      </span>
      <h3 className="text-xl font-bold text-gray-900 mt-5 group-hover:text-rose-600 transition-colors tracking-tight">
        {sec.title}
      </h3>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{sec.description}</p>
      {hasChildren && (
        <span className="inline-block mt-4 text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
          {sec.children.length} 个子章节
        </span>
      )}
      {!hasChildren && nodeCount > 0 && (
        <span className="inline-block mt-4 text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
          {nodeCount} 个节点
        </span>
      )}
    </>
  );

  /* ── clickable card ── */
  if (isClickable) {
    const sharedClass =
      "block w-full bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-8 " +
      "shadow-[0_2px_8px_rgba(0,0,0,0.04)] " +
      "hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_20px_rgba(255,61,88,0.1)] " +
      "hover:-translate-y-2 hover:scale-[1.02] " +
      "hover:bg-white hover:border-rose-200 " +
      "transition-all duration-300 ease-out cursor-pointer group text-left";

    return (
      <motion.div
        key={sec.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      >
        {hasChildren ? (
          <button onClick={() => onClick(sec)} className={sharedClass}>
            {content}
          </button>
        ) : (
          <Link to={linkTarget} className={sharedClass}>
            {content}
          </Link>
        )}
      </motion.div>
    );
  }

  /* ── disabled card ── */
  return (
    <motion.div
      key={sec.id}
      className="bg-gray-50/80 border border-gray-100 rounded-3xl p-8 opacity-50 cursor-default text-left"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 0.5, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <span className="text-4xl grayscale">{sec.icon || "📄"}</span>
      <h3 className="text-xl font-bold text-gray-400 mt-5 tracking-tight">{sec.title}</h3>
      <p className="text-sm text-gray-400 mt-2 leading-relaxed">{sec.description}</p>
      <span className="inline-block mt-4 text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
        即将上线
      </span>
    </motion.div>
  );
}

function SectionSubPage() {
  const { moduleId } = useParams();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentSection, setParentSection] = useState(null);

  const moduleInfo = courseModules.find((m) => m.id === moduleId);

  useEffect(() => {
    const loader = sectionsMap[moduleId];
    if (!loader) {
      setLoading(false);
      return;
    }
    loader()
      .then((mod) => setSections(mod.default || []))
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, [moduleId]);

  /* reset child drill-down when switching modules */
  useEffect(() => {
    setParentSection(null);
  }, [moduleId]);

  const handleDrillDown = useCallback((sec) => {
    setParentSection(sec);
  }, []);

  const handleBackToParent = useCallback(() => {
    setParentSection(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  const displayedSections = parentSection ? parentSection.children || [] : sections;
  const pageTitle = parentSection ? parentSection.title : moduleInfo?.title || moduleId;
  const pageDesc = parentSection ? parentSection.description : moduleInfo?.description || "";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 md:px-10 py-10 max-w-5xl mx-auto w-full">
        {/* ── Breadcrumb ── */}
        <div className="mb-2">
          <span className="text-sm text-gray-400">
            <Link to="/curriculum" className="text-rose-600 hover:text-rose-700 transition-colors">
              课程目录
            </Link>
            <span className="mx-1.5 text-gray-300">›</span>
            {parentSection ? (
              <>
                <button
                  onClick={handleBackToParent}
                  className="text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  {moduleInfo?.title || moduleId}
                </button>
                <span className="mx-1.5 text-gray-300">›</span>
                <span className="text-gray-500">{parentSection.title}</span>
              </>
            ) : (
              <span className="text-gray-500">{moduleInfo?.title || moduleId}</span>
            )}
          </span>
        </div>

        {/* ── Title ── */}
        <motion.div
          className="mb-10 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
          <p className="mt-2 text-gray-500 text-base">{pageDesc}</p>
        </motion.div>

        {/* ── Back button when drilled down ── */}
        <AnimatePresence>
          {parentSection && (
            <motion.button
              onClick={handleBackToParent}
              className="mb-6 flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ChevronLeft size={18} />
              返回上级
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Card grid ── */}
        {displayedSections.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>暂无内容</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={parentSection ? parentSection.id : "root"}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {displayedSections.map((sec, i) => (
                <SectionCard
                  key={sec.id}
                  sec={sec}
                  index={i}
                  onClick={handleDrillDown}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

export default SectionSubPage;
