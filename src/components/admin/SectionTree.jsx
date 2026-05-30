import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";

function TreeNode({ node, depth, selectedId, onSelect, onAddChild, onDelete, childMap }) {
  const [expanded, setExpanded] = useState(true);
  const children = childMap[node.id] || [];
  const hasChildren = children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div className="select-none">
      <div
        onClick={() => onSelect(node)}
        className={`flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group text-sm
          ${isSelected ? "bg-rose-100 text-rose-700" : "hover:bg-gray-50 text-gray-600"}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}
        <span className={`flex-1 truncate font-medium ${node.available ? "" : "text-gray-400"}`}>
          {node.title || "(未命名)"}
        </span>
        {!node.available && (
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">草稿</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
          className="p-0.5 rounded hover:bg-rose-100 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          title="添加子章节"
        >
          <Plus size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (confirm("删除此章节及其子章节？")) onDelete(node.id); }}
          className="p-0.5 rounded hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          title="删除"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="border-l border-gray-200 ml-4">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
              childMap={childMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildChildMap(sections) {
  const map = {};
  for (const s of sections) {
    const pid = s.parent_id || "__root__";
    if (!map[pid]) map[pid] = [];
    map[pid].push(s);
  }
  return map;
}

function SectionTree({ sections, selectedId, onSelect, onAddChild, onDelete, onImport, onReimport, loading }) {
  const childMap = buildChildMap(sections);
  const rootNodes = childMap["__root__"] || [];

  return (
    <div className="h-full flex flex-col border-r border-gray-100">
      <div className="p-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={() => onAddChild(null)}
          className="flex-1 py-1.5 text-sm rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
        >
          + 新建章节
        </button>
        <button
          onClick={onImport}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer flex-shrink-0"
        >
          导入
        </button>
        {onReimport && (
          <button
            onClick={onReimport}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer flex-shrink-0"
            title="重新读取教材 .md 文件更新 content 字段"
          >
            修复
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
          </div>
        ) : rootNodes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">暂无章节，点击"导入"或"+ 新建章节"</p>
        ) : (
          rootNodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
              childMap={childMap}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default SectionTree;
