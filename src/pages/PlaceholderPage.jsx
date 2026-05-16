import { Link, useLocation } from "react-router-dom";
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
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icon
            size={48}
            className="text-gray-300 mx-auto mb-4"
            strokeWidth={1.5}
          />
          <h1 className="text-xl font-semibold text-gray-700 mb-2">
            {info.title}
          </h1>
          <p className="text-gray-400">{info.description}</p>
          <Link
            to="/"
            className="inline-block mt-6 text-sm text-gold-600 hover:text-gold-700 underline underline-offset-2"
          >
            返回主菜单
          </Link>
        </div>
      </main>
    </div>
  );
}

export default PlaceholderPage;
