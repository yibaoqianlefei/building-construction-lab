import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2, MoreHorizontal } from "lucide-react";
import courseModules from "../../data/courseModules";

function TreeNode({ node, depth, selectedId, modules, onSelect, onAddChild, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const children = node._children || [];
  const hasChildren = children.length > 0;
  const isSelected = selectedId === node.id;
  const mod = modules.find((m) => m.id === node.module_id);

  return (
    <div className="select-none">
      <div
        onClick={() => onSelect(node)}
        className={`flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group text-sm
          ${isSelected ? "bg-rose-100 text-rose-700" : "hover:bg-gray-50 text-gray-600"}
          ${node.deleted_at ? "opacity-50 line-through" : ""}`}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        <span className={`flex-1 truncate text-xs ${node.available ? "font-medium" : ""}`}>
          {mod ? mod.icon + " " : ""}{node.title || "(未命名)"}
        </span>
        {!node.available && !node.deleted_at && (
          <span className="text-[9px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded-full flex-shrink-0">草稿</span>
        )}
        {node.deleted_at && (
          <span className="text-[9px] text-red-400 bg-red-50 px-1 py-0.5 rounded-full flex-shrink-0">已删</span>
        )}
        {/* more menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal size={11} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[100px]"
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setMenuOpen(false); onAddChild(node); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-rose-50 text-gray-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={11} /> 添加子章节
              </button>
              <button
                onClick={() => { setMenuOpen(false);
                  if (confirm("删除此章节？")) onDelete(node.id); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-gray-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={11} /> 删除
              </button>
            </div>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="border-l border-gray-150 ml-3">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              modules={modules}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSectionTree({ sections, selectedId, onSelect, onAddChild, onDelete, onImport, onReimport, loading }) {
  const [filterModule, setFilterModule] = useState("all");

  const filtered = filterModule === "all"
    ? sections
    : sections.filter((s) => s.module_id === filterModule);

  /* build tree: map children to parents */
  const childMap = {};
  const rootNodes = [];
  for (const s of filtered) {
    if (s.parent_id) {
      if (!childMap[s.parent_id]) childMap[s.parent_id] = [];
      childMap[s.parent_id].push(s);
    } else {
      rootNodes.push(s);
    }
  }
  /* attach children */
  function attachChildren(nodes) {
    return nodes.map((n) => ({
      ...n,
      _children: attachChildren(childMap[n.id] || []),
    }));
  }
  const treeNodes = attachChildren(rootNodes);

  const availableModules = courseModules.filter((m) => m.available);

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-100 space-y-1.5">
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-rose-300 bg-white cursor-pointer"
        >
          <option value="all">全部模块</option>
          {courseModules.map((m) => (
            <option key={m.id} value={m.id}>{m.icon} {m.title}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => onAddChild(null)}
            className="flex-1 py-1 text-xs rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            + 新建
          </button>
          <button
            onClick={onImport} disabled={loading}
            className="flex-1 py-1 text-[11px] rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
          >
            导入
          </button>
          {onReimport && (
            <button
              onClick={onReimport} disabled={loading}
              className="flex-1 py-1 text-[11px] rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            >
              修复
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
          </div>
        ) : treeNodes.length === 0 ? (
          <p className="text-[11px] text-gray-400 text-center py-8 px-3">
            {filterModule === "all"
              ? "暂无章节，点击「导入」初始化数据"
              : "该模块暂无章节"}
          </p>
        ) : (
          treeNodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              modules={courseModules}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default AdminSectionTree;
