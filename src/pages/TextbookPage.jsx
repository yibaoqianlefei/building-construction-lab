import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import roofSections from "../data/roofSections";
import { nodesIndex } from "../data/nodesIndex";
import { getTextbookSection, getSectionById } from "../services/contentService";
import { assetPath } from "../utils/baseUrl";

function ModelCard({ nodeId }) {
  const node = nodesIndex.find((n) => n.id === nodeId);
  if (!node) return null;

  return (
    <Link
      to={`/node/${node.id}`}
      className="block bg-surface-card border border-hairline
        rounded-xl p-5
        hover:shadow-[0_1px_3px_rgba(20,20,19,0.08)]
        hover:-translate-y-1 hover:scale-[1.01]
        hover:border-primary/30
        transition-all duration-300 ease-out
        cursor-pointer group max-w-md"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏠</span>
        <div className="min-w-0">
          <h4 className="text-base font-normal font-serif text-ink group-hover:text-primary transition-colors">
            {node.title}
          </h4>
          <p className="text-sm text-muted mt-0.5 line-clamp-2">
            {node.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
      className="flex-1 min-w-0 max-w-[45%] bg-surface-card border border-hairline
        rounded-xl p-4
        hover:shadow-[0_1px_3px_rgba(20,20,19,0.08)]
        hover:-translate-y-0.5 hover:border-primary/30
        transition-all duration-300 ease-out
        cursor-pointer group"
    >
      <div className="text-2xl mb-2">🏠</div>
      <h4 className="text-sm font-normal font-serif text-ink group-hover:text-primary transition-colors">
        {node.title}
      </h4>
      <p className="text-xs text-muted mt-1 line-clamp-2">
        {node.description}
      </p>
      <div className="mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
    <div className="overflow-x-auto my-6 rounded-lg border border-hairline">
      <table className="table-auto w-full text-sm text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-soft">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-body font-medium px-4 py-2.5 border-b border-hairline first:pl-5 last:pr-5">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 border-b border-hairline-soft text-body first:pl-5 last:pr-5">
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

    async function load() {
      /* 1. try course_sections DB (UUID or slug match) */
      try {
        const sec = await getSectionById(sectionId);
        console.log("[TextbookPage] course_sections match:", sectionId, sec ? "found" : "not found", sec?.content?.substring(0, 50) || "(empty)");
        if (sec?.content) return sec.content;
      } catch { /* fall through */ }

      /* 2. try textbook_sections DB */
      try {
        const row = await getTextbookSection(sectionId);
        console.log("[TextbookPage] textbook_sections match:", sectionId, row ? "found" : "not found");
        if (row?.content) return row.content;
      } catch { /* fall through */ }

      /* 3. fallback to file */
      console.log("[TextbookPage] falling back to file:", sectionId);
      const res = await fetch(assetPath(`/textbook/${sectionId}/content.md`));
      if (!res.ok) throw new Error("not found");
      return res.text();
    }

    load()
      .then((text) => setContent(text))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [sectionId]);

  if (!section) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-lg">章节不存在</p>
          <Link to="/curriculum/roof" className="text-primary hover:text-primary-active text-sm mt-2 inline-block">
            返回屋顶章节
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-muted-soft">教材加载中...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-lg">教材内容尚未编写</p>
          <Link to="/curriculum/roof" className="text-primary hover:text-primary-active text-sm mt-2 inline-block">
            返回屋顶章节
          </Link>
        </div>
      </div>
    );
  }

  const contentParts = parseContent(content);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <main className="flex-1 px-6 md:px-10 py-10 max-w-4xl mx-auto w-full">
        {/* breadcrumb */}
        <div className="mb-2">
          <span className="text-sm text-muted-soft">
            <Link to="/curriculum" className="text-primary hover:text-primary-active transition-colors">
              课程目录
            </Link>
            <span className="mx-1.5 text-muted-soft">›</span>
            <Link to="/curriculum/roof" className="text-primary hover:text-primary-active transition-colors">
              屋顶
            </Link>
            <span className="mx-1.5 text-muted-soft">›</span>
            <span className="text-muted">{section.title}</span>
          </span>
        </div>

        {/* content */}
        <article className="mt-6 prose max-w-none
          prose-headings:font-normal prose-headings:text-ink
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-body prose-p:leading-relaxed
          prose-li:text-body
          prose-th:text-body prose-td:text-body
          prose-table:border-collapse
          prose-blockquote:border-l-primary prose-blockquote:text-muted
          prose-strong:text-body-strong">
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
        <div className="mt-12 pt-6 border-t border-hairline">
          <Link
            to="/curriculum/roof"
            className="text-sm text-primary hover:text-primary-active transition-colors"
          >
            ← 返回屋顶章节
          </Link>
        </div>
      </main>
    </div>
  );
}

export default TextbookPage;
