import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import roofSections from "../data/roofSections";
import { nodesIndex } from "../data/nodesIndex";

function ModelCard({ nodeId }) {
  const node = nodesIndex.find((n) => n.id === nodeId);
  if (!node) return null;

  return (
    <Link
      to={`/node/${node.id}`}
      className="block bg-white/80 backdrop-blur-sm border border-gray-200/60
        rounded-2xl p-5
        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
        hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_8px_20px_rgba(212,164,58,0.08)]
        hover:-translate-y-1 hover:scale-[1.01]
        hover:bg-white hover:border-gold-200
        transition-all duration-300 ease-out
        cursor-pointer group max-w-md"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏠</span>
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-gray-900 group-hover:text-gold-600 transition-colors">
            {node.title}
          </h4>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
            {node.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        打开交互模型
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function ModelCardSmall({ nodeId }) {
  const node = nodesIndex.find((n) => n.id === nodeId);
  if (!node) return null;

  return (
    <Link
      to={`/node/${node.id}`}
      className="flex-1 min-w-0 max-w-[45%] bg-white/80 backdrop-blur-sm border border-gray-200/60
        rounded-xl p-4
        shadow-[0_2px_6px_rgba(0,0,0,0.04)]
        hover:shadow-[0_8px_16px_rgba(0,0,0,0.05),0_4px_12px_rgba(212,164,58,0.08)]
        hover:-translate-y-0.5 hover:border-gold-200
        transition-all duration-300 ease-out
        cursor-pointer group"
    >
      <div className="text-2xl mb-2">🏠</div>
      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gold-600 transition-colors">
        {node.title}
      </h4>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
        {node.description}
      </p>
      <div className="mt-2 text-xs text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        打开模型 →
      </div>
    </Link>
  );
}

function SideBySide({ content }) {
  const items = [];
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const modelRegex = /\[model:\s*([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const before = content.slice(lastIndex, match.index);
      let m;
      while ((m = modelRegex.exec(before)) !== null) {
        items.push({ type: "model", nodeId: m[1].trim() });
      }
    }
    items.push({ type: "image", src: match[2].trim(), alt: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex);
    let m;
    while ((m = modelRegex.exec(remaining)) !== null) {
      items.push({ type: "model", nodeId: m[1].trim() });
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 my-6 items-stretch">
      {items.map((item, i) => {
        if (item.type === "image") {
          return (
            <img
              key={`img-${i}`}
              src={item.src}
              alt={item.alt}
              className="flex-1 min-w-0 max-w-[45%] rounded-xl shadow-sm object-cover"
              loading="lazy"
            />
          );
        }
        return <ModelCardSmall key={`model-${i}`} nodeId={item.nodeId} />;
      })}
    </div>
  );
}

const markdownComponents = {
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="rounded-lg shadow-sm max-w-full h-auto my-6"
      loading="lazy"
    />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-gray-200">
      <table className="table-auto w-full text-sm text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-gray-700 font-medium px-4 py-2.5 border-b border-gray-200 first:pl-5 last:pr-5">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 border-b border-gray-100 text-gray-600 first:pl-5 last:pr-5">
      {children}
    </td>
  ),
};

function parseContent(content) {
  if (!content) return [];

  const parts = [];
  const ssRegex = /\[side-by-side\]([\s\S]*?)\[\/side-by-side\]/g;
  const modelRegex = /\[model:\s*([^\]]+)\]/g;
  let lastIndex = 0;
  let ssMatch;

  while ((ssMatch = ssRegex.exec(content)) !== null) {
    if (ssMatch.index > lastIndex) {
      const textChunk = content.slice(lastIndex, ssMatch.index);
      let m;
      let chunkLast = 0;
      while ((m = modelRegex.exec(textChunk)) !== null) {
        if (m.index > chunkLast) {
          parts.push({ type: "markdown", text: textChunk.slice(chunkLast, m.index) });
        }
        parts.push({ type: "model", nodeId: m[1].trim() });
        chunkLast = m.index + m[0].length;
      }
      if (chunkLast < textChunk.length) {
        parts.push({ type: "markdown", text: textChunk.slice(chunkLast) });
      } else if (chunkLast === 0 && textChunk.length > 0) {
        parts.push({ type: "markdown", text: textChunk });
      }
    }
    parts.push({ type: "side-by-side", inner: ssMatch[1] });
    lastIndex = ssMatch.index + ssMatch[0].length;
  }

  if (lastIndex < content.length) {
    const textChunk = content.slice(lastIndex);
    let m;
    let chunkLast = 0;
    while ((m = modelRegex.exec(textChunk)) !== null) {
      if (m.index > chunkLast) {
        parts.push({ type: "markdown", text: textChunk.slice(chunkLast, m.index) });
      }
      parts.push({ type: "model", nodeId: m[1].trim() });
      chunkLast = m.index + m[0].length;
    }
    if (chunkLast < textChunk.length) {
      parts.push({ type: "markdown", text: textChunk.slice(chunkLast) });
    } else if (chunkLast === 0 && textChunk.length > 0) {
      parts.push({ type: "markdown", text: textChunk });
    }
  }

  return parts.length > 0 ? parts : [{ type: "markdown", text: content }];
}

function TextbookPage() {
  const { sectionId } = useParams();
  const section = useMemo(
    () => roofSections.find((s) => s.id === sectionId),
    [sectionId]
  );
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sectionId) return;
    setLoading(true);
    fetch(`/textbook/${sectionId}/content.md`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.text();
      })
      .then((text) => setContent(text))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [sectionId]);

  if (!section) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">章节不存在</p>
          <Link to="/curriculum/roof" className="text-gold-600 hover:text-gold-700 text-sm mt-2 inline-block">
            返回屋顶章节
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">教材加载中...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">教材内容尚未编写</p>
          <Link to="/curriculum/roof" className="text-gold-600 hover:text-gold-700 text-sm mt-2 inline-block">
            返回屋顶章节
          </Link>
        </div>
      </div>
    );
  }

  const contentParts = parseContent(content);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 md:px-10 py-10 max-w-4xl mx-auto w-full">
        {/* breadcrumb */}
        <div className="mb-2">
          <span className="text-sm text-gray-400">
            <Link to="/curriculum" className="text-gold-600 hover:text-gold-700 transition-colors">
              课程目录
            </Link>
            <span className="mx-1.5 text-gray-300">›</span>
            <Link to="/curriculum/roof" className="text-gold-600 hover:text-gold-700 transition-colors">
              屋顶
            </Link>
            <span className="mx-1.5 text-gray-300">›</span>
            <span className="text-gray-500">{section.title}</span>
          </span>
        </div>

        {/* content */}
        <article className="mt-6 prose prose-gray max-w-none
          prose-headings:font-serif prose-headings:text-gray-900
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-gray-600 prose-p:leading-relaxed
          prose-li:text-gray-600
          prose-th:text-gray-700 prose-td:text-gray-600
          prose-table:border-collapse
          prose-blockquote:border-l-gold-400 prose-blockquote:text-gray-500
          prose-strong:text-gray-800">
          {contentParts.map((part, i) => {
            if (part.type === "side-by-side") {
              return <SideBySide key={`ss-${i}`} content={part.inner} />;
            }
            if (part.type === "model") {
              return <ModelCard key={`model-${i}`} nodeId={part.nodeId} />;
            }
            return (
              <ReactMarkdown
                key={`md-${i}`}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {part.text}
              </ReactMarkdown>
            );
          })}
        </article>

        {/* back link */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            to="/curriculum/roof"
            className="text-sm text-gold-600 hover:text-gold-700 transition-colors"
          >
            ← 返回屋顶章节
          </Link>
        </div>
      </main>
    </div>
  );
}

export default TextbookPage;
