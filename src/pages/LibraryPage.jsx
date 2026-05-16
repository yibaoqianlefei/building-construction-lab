import { Link } from "react-router-dom";
import { FiBookOpen, FiHelpCircle, FiGithub } from "react-icons/fi";
import { nodesIndex } from "../data/nodesIndex";

function WallThumbnail() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="8" width="6" height="48" rx="1" fill="#D4C5B9" />
      <rect x="10" y="8" width="18" height="48" rx="1" fill="#9E9E9E" />
      <rect x="30" y="8" width="14" height="48" rx="1" fill="#FF9800" />
      <rect x="46" y="8" width="6" height="48" rx="1" fill="#81D4FA" opacity="0.6" />
      <rect x="54" y="8" width="8" height="48" rx="1" fill="#8D6E63" />

      <rect x="2" y="8" width="6" height="48" rx="1" stroke="#9CA3AF" strokeWidth="0.5" />
      <rect x="10" y="8" width="18" height="48" rx="1" stroke="#9CA3AF" strokeWidth="0.5" />
      <rect x="30" y="8" width="14" height="48" rx="1" stroke="#9CA3AF" strokeWidth="0.5" />
      <rect x="46" y="8" width="6" height="48" rx="1" stroke="#9CA3AF" strokeWidth="0.5" />
      <rect x="54" y="8" width="8" height="48" rx="1" stroke="#9CA3AF" strokeWidth="0.5" />

      <line x1="2" y1="24" x2="62" y2="24" stroke="#9CA3AF" strokeWidth="0.5" />
      <line x1="2" y1="40" x2="62" y2="40" stroke="#9CA3AF" strokeWidth="0.5" />
    </svg>
  );
}

function NodeCard({ node }) {
  return (
    <Link
      to={`/node/${node.id}`}
      className="block bg-gray-50 border border-gray-200 rounded-xl p-5
        hover:shadow-md hover:border-academic-300 transition-all duration-200
        cursor-pointer group"
    >
      <div className="w-full h-24 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden group-hover:bg-gray-200/70 transition-colors">
        <div className="w-16 h-16 text-gray-400">
          <WallThumbnail />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-academic-600 transition-colors">
        {node.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
        {node.description}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-academic-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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

function LibraryPage() {
  const categories = [...new Set(nodesIndex.map((n) => n.category))];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="pt-10 pb-8 md:pt-14 md:pb-10 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
          节点库
        </h1>
        <p className="mt-2 text-gray-400 text-sm max-w-lg mx-auto">
          浏览所有建筑构造节点，选择感兴趣的系统进行交互式探索。
        </p>
      </header>

      <main className="flex-1 px-4 md:px-8 pb-16 max-w-5xl mx-auto w-full">
        {categories.map((category) => (
          <section key={category} className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-academic-500 rounded-full flex-shrink-0" />
              <h2 className="text-xl text-gray-600 font-medium tracking-wide">
                {category}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nodesIndex
                .filter((n) => n.category === category)
                .map((node) => (
                  <NodeCard key={node.id} node={node} />
                ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-400">
            © 2026 建筑构造交互系统
          </span>
          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-academic-500 transition-colors flex items-center gap-1.5"
            >
              <FiBookOpen size={14} />
              关于项目
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-academic-500 transition-colors flex items-center gap-1.5"
            >
              <FiHelpCircle size={14} />
              使用说明
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-academic-500 transition-colors flex items-center gap-1.5"
            >
              <FiGithub size={14} />
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default LibraryPage;
