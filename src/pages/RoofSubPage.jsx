import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import roofSections from "../data/roofSections";

function RoofSubPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 md:px-10 py-10 max-w-5xl mx-auto w-full">
        {/* breadcrumb */}
        <div className="mb-2">
          <span className="text-sm text-gray-400">
            <Link
              to="/curriculum"
              className="text-gold-600 hover:text-gold-700 transition-colors"
            >
              课程目录
            </Link>
            <span className="mx-1.5 text-gray-300">›</span>
            <span className="text-gray-500">屋顶</span>
          </span>
        </div>

        {/* header */}
        <div className="mb-10 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            屋顶构造
          </h1>
          <p className="mt-2 text-gray-500 text-base">
            探索各类屋顶的形式、构造层次与设计要点
          </p>
        </div>

        {/* section cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {roofSections.map((section, i) => {
            const canEnter = section.available && section.nodeIds.length > 0;

            const cardContent = (
              <div
                className={`bg-white/80 backdrop-blur-sm border rounded-3xl p-8
                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                  transition-all duration-300 ease-out
                  ${canEnter
                    ? "border-gray-200/60 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_20px_rgba(212,164,58,0.1)] hover:-translate-y-2 hover:scale-[1.02] hover:bg-white hover:border-gold-200 cursor-pointer group"
                    : "border-gray-100 opacity-50 cursor-default"
                  }`}
              >
                <div className="w-full h-24 bg-gray-50 rounded-2xl mb-5 flex items-center justify-center text-4xl">
                  🏠
                </div>

                <h3
                  className={`text-xl font-bold tracking-tight transition-colors
                    ${canEnter ? "text-gray-900 group-hover:text-gold-600" : "text-gray-400"}`}
                >
                  {section.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-3">
                  {section.description}
                </p>

                <span
                  className={`inline-block mt-4 text-xs font-medium px-3 py-1 rounded-full
                    ${canEnter
                      ? "text-gold-600 bg-gold-50 group-hover:bg-gold-100"
                      : "text-gray-400 bg-gray-100"}`}
                >
                  {canEnter ? "进入节点" : "即将上线"}
                </span>

                {canEnter && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    开始学习
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
                )}
              </div>
            );

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
              >
                {canEnter ? (
                  <Link to={`/node/${section.nodeIds[0]}`} className="block">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default RoofSubPage;
