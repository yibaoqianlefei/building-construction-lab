import { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Maximize2, Minimize2 } from "lucide-react";
import courseModules from "../../data/courseModules";
import { nodesIndex } from "../../data/nodesIndex";
import { updateSection, uploadMedia } from "../../services/contentService";

const MODULE_OPTIONS = courseModules.map((m) => ({ value: m.id, label: `${m.icon || ""} ${m.title}` }));

function SectionEditor({ section, onSaved, onRefresh, onRestore }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [available, setAvailable] = useState(false);
  const [nodeIds, setNodeIds] = useState([]);
  const [diagramImageUrl, setDiagramImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const isDeleted = !!(section?.deleted_at);
  const fileInputRef = useRef(null);
  const diagramInputRef = useRef(null);

  /* Esc to exit fullscreen */
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  /* load section data when selection changes */
  useEffect(() => {
    if (!section) {
      setTitle("");
      setDescription("");
      setContent("");
      setModuleId("");
      setAvailable(false);
      setNodeIds([]);
      setDiagramImageUrl("");
      return;
    }
    setTitle(section.title || "");
    setDescription(section.description || "");
    setContent(section.content || "");
    setModuleId(section.module_id || "");
    setAvailable(section.available || false);
    setNodeIds(Array.isArray(section.node_ids) ? section.node_ids : []);
    setDiagramImageUrl(section.diagram_image_url || "");
  }, [section]);

  async function handleSave() {
    if (!section) return;
    setSaving(true);
    try {
      await updateSection(section.id, {
        title,
        description,
        content,
        module_id: moduleId || null,
        available,
        node_ids: nodeIds,
        diagram_image_url: diagramImageUrl || null,
      });
      alert("保存成功");
      onSaved?.();
    } catch (e) {
      alert("保存失败: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      const md = `![${file.name}](${url})`;
      setContent((prev) => prev + "\n" + md + "\n");
    } catch (err) {
      alert("上传失败: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDiagramUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      setDiagramImageUrl(url);
    } catch (err) {
      alert("上传失败: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  function toggleNodeId(id) {
    setNodeIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  }

  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-soft text-sm">
        选择或新建一个章节开始编辑
      </div>
    );
  }

  /* ── MD editor element (shared) ── */
  const mdEditor = (
    <MDEditor
      value={content}
      onChange={(val) => setContent(val || "")}
      height={fullscreen ? "100%" : "60vh"}
      preview="edit"
      visibleDragbar={false}
    />
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* restore banner for deleted sections */}
      {isDeleted && onRestore && (
        <div className="px-4 py-2.5 bg-warning/10 border-b border-warning/30 flex items-center justify-between">
          <span className="text-sm text-warning">
            <span className="font-medium">已删除</span>
            <span className="text-warning ml-2 text-xs">
              {new Date(section.deleted_at).toLocaleString()}
            </span>
          </span>
          <button
            onClick={() => onRestore(section.id)}
            className="px-3 py-1 text-xs rounded-lg bg-warning text-on-primary hover:bg-warning transition-colors cursor-pointer"
          >
            恢复章节
          </button>
        </div>
      )}

      {/* toolbar */}
      <div className="px-4 py-3 border-b border-hairline space-y-2">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="章节标题"
            className="flex-1 text-sm px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary"
          />
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-36 text-sm px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary bg-canvas"
          >
            <option value="">无模块</option>
            {MODULE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述"
            className="flex-1 text-sm px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary"
          />
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="accent-primary"
            />
            可用
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm rounded-lg bg-primary text-on-primary hover:bg-primary-active disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <label className="px-3 py-1.5 text-xs rounded-lg border border-hairline text-muted hover:text-primary hover:border-primary/30 transition-colors cursor-pointer">
            {uploading ? "上传中..." : "上传图片"}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      {/* main content area — scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Markdown editor */}
        <div className="border-b border-hairline">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-muted-soft font-medium uppercase tracking-wider">教材内容 (Markdown)</span>
            <button
              onClick={() => setFullscreen((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-hairline text-muted-soft hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
              title={fullscreen ? "退出全屏 (Esc)" : "全屏编辑"}
            >
              {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span className="hidden sm:inline">{fullscreen ? "退出" : "全屏"}</span>
            </button>
          </div>
          {mdEditor}
        </div>

        {/* diagram image */}
        <div className="px-4 py-3 border-b border-hairline">
          <div className="text-xs text-muted-soft font-medium uppercase tracking-wider mb-2">剖面图</div>
          <div className="flex items-center gap-3">
            <label className="px-3 py-1.5 text-xs rounded-lg border border-hairline text-muted hover:text-primary hover:border-primary/30 transition-colors cursor-pointer">
              上传剖面图
              <input ref={diagramInputRef} type="file" accept="image/*" className="hidden" onChange={handleDiagramUpload} />
            </label>
            {diagramImageUrl && (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src={diagramImageUrl} alt="剖面图" className="h-10 w-auto rounded border border-hairline object-contain" />
                <button
                  onClick={() => setDiagramImageUrl("")}
                  className="text-xs text-error hover:text-error transition-colors cursor-pointer"
                >
                  清除
                </button>
              </div>
            )}
          </div>
        </div>

        {/* model association */}
        <div className="px-4 py-3">
          <div className="text-xs text-muted-soft font-medium uppercase tracking-wider mb-2">关联模型节点</div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {nodesIndex.map((n) => {
              const checked = nodeIds.includes(n.id);
              return (
                <label
                  key={n.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors
                    ${checked ? "bg-hairline text-primary" : "hover:bg-surface-card text-body"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleNodeId(n.id)}
                    className="accent-primary"
                  />
                  <span className="truncate">{n.title}</span>
                  <span className="text-muted-soft flex-shrink-0">{n.category}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── fullscreen overlay ── */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-canvas flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-hairline bg-surface-soft flex-shrink-0">
            <span className="text-sm font-medium text-body">
              编辑：{title || section.title}
            </span>
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-hairline text-muted hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
            >
              <Minimize2 size={13} />
              退出全屏 (Esc)
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height="100%"
              preview="live"
              visibleDragbar={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SectionEditor;
