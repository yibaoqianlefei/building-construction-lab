import { useLocation } from "react-router-dom";
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
    <div className="min-h-screen bg-canvas flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icon
            size={48}
            className="text-muted-soft mx-auto mb-4"
            strokeWidth={1.5}
          />
          <h1 className="text-xl font-semibold text-body-strong mb-2">
            {info.title}
          </h1>
          <p className="text-muted-soft">{info.description}</p>
        </div>
      </main>
    </div>
  );
}

export default PlaceholderPage;
