import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import courseModules from "../data/courseModules";
import { nodesIndex } from "../data/nodesIndex";

function NodeCard({ node }) {
  return (
    <Link
      to={`/node/${node.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5
        hover:shadow-md hover:border-academic-300 transition-all duration-200
        cursor-pointer group"
    >
      <div className="w-full h-20 bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-3xl">
        🧱
      </div>

      <h3 className="text-base font-semibold text-gray-800 group-hover:text-academic-600 transition-colors">
        {node.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
        {node.description}
      </p>

      <div className="mt-2 flex items-center gap-1 text-xs text-academic-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
}

function ModuleDetail({ module, onBack }) {
  const moduleNodes = module.nodeIds
    .map((id) => {
      const node = nodesIndex.find((n) => n.id === id);
      if (!node) {
        console.warn(`课程模块 "${module.title}": 节点 "${id}" 未在 nodesIndex 中找到`);
      }
      return node;
    })
    .filter(Boolean);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-academic-500 hover:text-academic-600 transition-colors mb-6"
      >
        <FiArrowLeft size={16} />
        返回模块列表
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{module.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{module.description}</p>
      </div>

      {moduleNodes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>暂无节点</p>
          <p className="text-xs mt-1">该模块的构造节点正在建设中</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {moduleNodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

function CurriculumPage() {
  const [selectedModule, setSelectedModule] = useState(null);

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex-1 px-4 md:px-8 py-8 max-w-5xl mx-auto w-full">
          <ModuleDetail
            module={selectedModule}
            onBack={() => setSelectedModule(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-4 md:px-8 py-10 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            课程目录
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            选择要学习的构造模块
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courseModules.map((mod) => {
            const nodeCount = mod.nodeIds.filter((id) =>
              nodesIndex.some((n) => n.id === id)
            ).length;

            if (mod.available) {
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className="bg-white border border-gray-200 rounded-xl p-6
                    shadow-sm hover:shadow-md hover:-translate-y-1
                    transition-all duration-300 cursor-pointer
                    text-left group"
                >
                  <span className="text-4xl">{mod.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-800 mt-4 group-hover:text-academic-600 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    {mod.description}
                  </p>
                  <span className="inline-block mt-3 text-xs text-academic-500 bg-academic-50 px-2 py-0.5 rounded-full">
                    {nodeCount} 个节点
                  </span>
                </button>
              );
            }

            return (
              <div
                key={mod.id}
                className="bg-gray-50 border border-gray-100 rounded-xl p-6
                  opacity-60 cursor-default text-left"
              >
                <span className="text-4xl grayscale">{mod.icon}</span>
                <h3 className="text-xl font-semibold text-gray-500 mt-4">
                  {mod.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                  {mod.description}
                </p>
                <span className="inline-block mt-3 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  即将上线
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default CurriculumPage;
