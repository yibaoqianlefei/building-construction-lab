import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Compass, Wrench, BookOpen, GitPullRequest } from "lucide-react";

const pageInfo = {
  "/curriculum": {
    title: "开始探索",
    Icon: Compass,
    description: "课程内容即将上线，敬请期待。",
  },
  "/tools": {
    title: "构造工具",
    Icon: Wrench,
    description: "工具即将上线。",
  },
  "/notes": {
    title: "我的笔记",
    Icon: BookOpen,
    description: "笔记功能即将上线。",
  },
  "/contribute": {
    title: "贡献节点",
    Icon: GitPullRequest,
    description: "贡献功能即将上线。",
  },
};

function PlaceholderPage() {
  const { pathname } = useLocation();
  const info = pageInfo[pathname] || {
    title: "页面",
    Icon: Compass,
    description: "即将上线。",
  };
  const { Icon } = info;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="flex items-center px-5 md:px-8 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="text-academic-500 hover:text-academic-600 transition-colors"
            title="返回主菜单"
          >
            <FiArrowLeft size={18} />
          </Link>
          <span className="text-sm font-medium text-gray-500 tracking-wider">
            {info.title}
          </span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icon
            size={48}
            className="text-gray-300 mx-auto mb-4"
            strokeWidth={1.5}
          />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {info.title}
          </h2>
          <p className="text-gray-400">{info.description}</p>
          <Link
            to="/"
            className="inline-block mt-6 text-sm text-academic-500 hover:text-academic-600 underline underline-offset-2"
          >
            返回主菜单
          </Link>
        </div>
      </main>
    </div>
  );
}

export default PlaceholderPage;
