import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { useAuth } from "../contexts/AuthContext";
import AdminSectionTree from "../components/admin/AdminSectionTree";
import courseModules from "../data/courseModules";
import { nodesIndex } from "../data/nodesIndex";
import { assetPath } from "../utils/baseUrl";
import {
  listTextbookSections, getTextbookSection, upsertTextbookSection, deleteTextbookSection,
  listNodeDefinitions, getNodeDefinition, upsertNodeDefinition, deleteNodeDefinition,
  listAllSections, createSection, updateSection,
  softDeleteSection, restoreSection, logActivity,
  uploadMedia,
} from "../services/contentService";

/* ── helpers ── */
function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" });
}

/* ════════════════════════════════════════════════════════════════════════════ */

function AdminContentPage() {
  const { profile } = useAuth();
  const { tab } = useParams();
  const navigate = useNavigate();
  const currentTab = tab || "sections";

  if (!profile || (profile as any).role !== "developer") {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-muted">仅开发者可访问此页面</p>
      </div>
    );
  }

  const TABS = [
    { id: "sections", label: "章节管理" },
    { id: "nodes", label: "节点管理" },
    { id: "media", label: "媒体库" },
    { id: "textbook", label: "旧版教材" },
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col h-screen">
      <Toaster position="top-right" richColors closeButton />
      <div className="px-5 py-2.5 border-b border-hairline flex items-center gap-6 flex-shrink-0">
        <h2 className="text-sm font-semibold text-body-strong">管理后台</h2>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/admin/${t.id}`)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                currentTab === t.id ? "bg-hairline text-primary" : "text-muted hover:text-body"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {currentTab === "sections" ? (
          <SectionsManager profile={profile} />
        ) : currentTab === "nodes" ? (
          <NodeEditor />
        ) : currentTab === "media" ? (
          <MediaLibrary />
        ) : (
          <TextbookEditor />
        )}
      </div>
    </div>
  );
}

/* ════════════════════ SECTIONS MANAGER (3-column) ════════════════════════ */

function SectionsManager({ profile }: any) {
  const [sections, setSections] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [lastSaved, setLastSaved] = useState("");

  /* ── editor state ── */
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [content, setContent] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [available, setAvailable] = useState(false);
  const [nodeIds, setNodeIds] = useState<string[]>([]);
  const [diagramUrl, setDiagramUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const autoSaveTimer = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const diagramInputRef = useRef<HTMLInputElement>(null);

  /* ── load ── */
  useEffect(() => { loadSections(); }, []);

  async function loadSections() {
    setLoading(true);
    const data = await listAllSections(true);
    setSections(data || []);
    setLoading(false);
  }

  /* ── sync editor from selected ── */
  useEffect(() => {
    if (!selected) {
      setTitle(""); setDesc(""); setContent(""); setModuleId("");
      setAvailable(false); setNodeIds([]); setDiagramUrl("");
      return;
    }
    setTitle(selected.title || "");
    setDesc(selected.description || "");
    setContent(selected.content || "");
    setModuleId(selected.module_id || "");
    setAvailable(selected.available || false);
    setNodeIds(Array.isArray(selected.node_ids) ? selected.node_ids : []);
    setDiagramUrl(selected.diagram_image_url || "");
  }, [selected]);

  /* ── auto-save (2s debounce) ── */
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(true), 2000);
  }, [title, desc, content, moduleId, available, nodeIds, diagramUrl, selected]);

  useEffect(() => {
    if (!selected || selected.deleted_at) return;
    triggerAutoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, desc, content, moduleId, available, nodeIds, diagramUrl]);

  async function doSave(silent = false) {
    if (!selected || selected.deleted_at) return;
    setSaving(true);
    try {
      await updateSection(selected.id, {
        title, description: desc, content,
        module_id: moduleId || null, available,
        node_ids: nodeIds, diagram_image_url: diagramUrl || null,
      });
      const now = new Date().toISOString();
      setLastSaved(now);
      if (!silent) toast.success("已保存");
      await logActivity((profile as any).id || "anon", "update", "section", selected.id, { title });
    } catch (e: any) {
      if (!silent) toast.error("保存失败: " + e.message);
    } finally { setSaving(false); }
  }

  /* ── keyboard save ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        doSave(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, title, desc, content, moduleId, available, nodeIds, diagramUrl]);

  /* ── handlers ── */
  async function handleAddChild(parent: any) {
    const t = prompt("章节标题：");
    if (!t) return;
    try {
      const created = await createSection({
        title: t, module_id: parent?.module_id || null,
        parent_id: parent?.id || null, sort_order: 0, available: false, node_ids: [],
      });
      toast.success("章节已创建");
      await logActivity((profile as any).id || "anon", "create", "section", created.id, { title: t });
      await loadSections();
      setSelected(created);
    } catch (e: any) { toast.error("创建失败: " + e.message); }
  }

  async function handleDelete(id: string) {
    try {
      await softDeleteSection(id);
      toast("已移至回收站", {
        action: { label: "撤销", onClick: async () => {
          await restoreSection(id); await loadSections();
          toast.success("已恢复");
        }},
      });
      if (selected?.id === id) setSelected({ ...selected, deleted_at: new Date().toISOString() });
      await logActivity((profile as any).id || "anon", "soft_delete", "section", id, {});
      await loadSections();
    } catch (e: any) { toast.error("删除失败: " + e.message); }
  }

  async function handleRestore(id: string) {
    try {
      await restoreSection(id);
      toast.success("已恢复");
      setSelected(null);
      await loadSections();
    } catch (e: any) { toast.error("恢复失败: " + e.message); }
  }

  async function handleImport() {
    if (!confirm("从代码文件导入所有模块章节？")) return;
    setImporting(true);
    try {
      const moduleSections = [
        { module: "introduction", file: "../data/sections/introSections" },
        { module: "structures", file: "../data/sections/structureSections" },
        { module: "foundation", file: "../data/sections/foundationSections" },
        { module: "wall", file: "../data/sections/wallSections" },
        { module: "floor", file: "../data/sections/floorSections" },
        { module: "stairs", file: "../data/sections/stairsSections" },
        { module: "door-window", file: "../data/sections/windowSections" },
        { module: "roof", file: "../data/sections/roofSections" },
        { module: "cases", file: "../data/sections/caseSections" },
      ];
      let count = 0;
      for (const ms of moduleSections) {
        try {
          const mod = await import(/* @vite-ignore */ ms.file);
          const secs = mod.default || [];
          for (let i = 0; i < secs.length; i++) {
            const sec = secs[i];
            let textbookContent = "";
            if (sec.hasTextbook || sec.content) {
              const cid = typeof sec.content === "string" && sec.content ? sec.content : sec.id;
              try { const r = await fetch(assetPath(`/textbook/${cid}/content.md`)); if (r.ok) textbookContent = await r.text(); } catch {}
            }
            const created = await createSection({
              title: sec.title, description: sec.description || "", module_id: ms.module,
              parent_id: null, sort_order: i, available: sec.available !== false,
              node_ids: sec.nodeIds || [], content: textbookContent, slug: sec.id || null,
            }); count++;
            const children = sec.children || [];
            for (let j = 0; j < children.length; j++) {
              const child = children[j];
              let cc = "";
              if (child.hasTextbook || child.content) {
                const cid2 = typeof child.content === "string" && child.content ? child.content : child.id;
                try { const r = await fetch(`/textbook/${cid2}/content.md`); if (r.ok) cc = await r.text(); } catch {}
              }
              await createSection({
                title: child.title, description: child.description || "", module_id: ms.module,
                parent_id: created.id, sort_order: j, available: child.available !== false,
                node_ids: child.nodeIds || [], content: cc, slug: child.id || null,
              }); count++;
            }
          }
        } catch {}
      }
      toast.success(`导入完成：${count} 个章节`);
      await loadSections();
    } catch (e: any) { toast.error("导入失败: " + e.message); }
    finally { setImporting(false); }
  }

  /* ── image upload ── */
  async function handleImageUpload(e: any) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      setContent((p) => p + `\n![${file.name}](${url})\n`);
      toast.success("图片已上传");
    } catch (err: any) { toast.error("上传失败: " + err.message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  async function handleDiagramUpload(e: any) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadMedia(file); setDiagramUrl(url); toast.success("剖面图已上传"); }
    catch (err: any) { toast.error("上传失败: " + err.message); }
    finally { setUploading(false); }
  }

  function toggleNodeId(id: string) {
    setNodeIds((p) => p.includes(id) ? p.filter((n) => n !== id) : [...p, id]);
  }

  /* ── stats for right panel ── */
  const childCount = sections.filter((s) => s.parent_id === selected?.id).length;
  const associatedNodes = (selected?.node_ids || []).length;

  const isDeleted = !!(selected?.deleted_at);

  return (
    <div className="flex h-full">
      {/* ── LEFT: Section Tree (w-64) ── */}
      <div className="w-64 flex-shrink-0 border-r border-hairline">
        <AdminSectionTree
          sections={sections}
          selectedId={selected?.id}
          onSelect={setSelected}
          onAddChild={handleAddChild}
          onDelete={handleDelete}
          onImport={handleImport}
          loading={loading || importing}
        />
      </div>

      {/* ── CENTER: Editor (flex-1) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-soft text-sm">
            选择一个章节开始编辑
          </div>
        ) : (
          <>
            {/* restore banner */}
            {isDeleted && (
              <div className="px-4 py-2.5 bg-warning/10 border-b border-warning/30 flex items-center justify-between">
                <span className="text-sm text-warning font-medium">已删除</span>
                <button onClick={() => handleRestore(selected.id)}
                  className="px-3 py-1 text-xs rounded-lg bg-warning text-on-primary hover:bg-warning transition-colors cursor-pointer">
                  恢复章节
                </button>
              </div>
            )}

            {/* ── toolbar ── */}
            <div className="px-4 py-2.5 border-b border-hairline space-y-2 flex-shrink-0">
              <div className="flex gap-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="章节标题"
                  className="flex-1 text-sm px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary"
                  disabled={isDeleted} />
                <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}
                  className="w-32 text-xs px-2 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary bg-canvas"
                  disabled={isDeleted}>
                  <option value="">无模块</option>
                  {courseModules.map((m) => (
                    <option key={m.id} value={m.id}>{m.icon} {m.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="描述"
                  className="flex-1 text-xs px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary"
                  disabled={isDeleted} />
                <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)}
                    className="accent-primary" disabled={isDeleted} />
                  可用
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => doSave(false)} disabled={saving || isDeleted}
                  className="px-4 py-1.5 text-xs rounded-lg bg-primary text-on-primary hover:bg-primary-active disabled:opacity-50 transition-colors cursor-pointer">
                  {saving ? "..." : "保存 ⌘S"}
                </button>
                <label className={`px-3 py-1.5 text-xs rounded-lg border border-hairline text-muted hover:text-primary transition-colors cursor-pointer ${isDeleted ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading ? "上传中..." : "上传图片"}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <span className="text-[10px] text-muted-soft ml-auto">
                  {saving ? "保存中..." : lastSaved ? `上次保存 ${formatTime(lastSaved)}` : "自动保存已启用"}
                </span>
              </div>
            </div>

            {/* ── scrollable content area ── */}
            <div className="flex-1 overflow-y-auto">
              {/* Markdown editor */}
              <div className="border-b border-hairline">
                <div className="px-4 py-1.5 text-[11px] text-muted-soft uppercase tracking-wider font-medium">
                  教材内容 (Markdown) — 停止输入 2 秒后自动保存
                </div>
                <MDEditor value={content} onChange={(v) => setContent(v || "")}
                  height="50vh" preview="edit" visibleDragbar={false} />
              </div>

              {/* diagram */}
              <div className="px-4 py-3 border-b border-hairline">
                <div className="text-[11px] text-muted-soft uppercase tracking-wider font-medium mb-2">剖面图</div>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-1.5 text-xs rounded-lg border border-hairline text-muted hover:text-primary transition-colors cursor-pointer">
                    上传剖面图
                    <input ref={diagramInputRef} type="file" accept="image/*" className="hidden" onChange={handleDiagramUpload} />
                  </label>
                  {diagramUrl && (
                    <div className="flex items-center gap-2">
                      <img src={diagramUrl} alt="剖面图" className="h-10 w-auto rounded border border-hairline object-contain" />
                      <button onClick={() => setDiagramUrl("")}
                        className="text-xs text-error hover:text-error transition-colors cursor-pointer">清除</button>
                    </div>
                  )}
                </div>
              </div>

              {/* model association */}
              <div className="px-4 py-3">
                <div className="text-[11px] text-muted-soft uppercase tracking-wider font-medium mb-2">关联模型节点</div>
                <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto">
                  {nodesIndex.map((n) => {
                    const checked = nodeIds.includes(n.id);
                    return (
                      <label key={n.id} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] cursor-pointer transition-colors ${checked ? "bg-hairline text-primary" : "hover:bg-surface-card text-muted"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleNodeId(n.id)} className="accent-primary w-3 h-3" />
                        <span className="truncate">{n.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Properties Panel (w-64) ── */}
      <div className="w-64 flex-shrink-0 border-l border-hairline bg-surface-soft p-4 overflow-y-auto">
        <h3 className="text-[11px] text-muted-soft uppercase tracking-wider font-medium mb-3">属性</h3>
        {selected ? (
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-soft">子章节</span>
              <span className="float-right text-body font-medium">{childCount}</span>
            </div>
            <div>
              <span className="text-muted-soft">关联模型</span>
              <span className="float-right text-body font-medium">{associatedNodes}</span>
            </div>
            <div className="border-t border-hairline pt-2">
              <span className="text-muted-soft block">创建时间</span>
              <span className="text-body">{formatTime(selected.created_at)}</span>
            </div>
            <div>
              <span className="text-muted-soft block">更新时间</span>
              <span className="text-body">{formatTime(selected.updated_at)}</span>
            </div>
            <div>
              <span className="text-muted-soft block">Slug</span>
              <code className="text-[10px] text-muted bg-hairline px-1 rounded">{selected.slug || "(自动生成)"}</code>
            </div>
            {isDeleted && (
              <div className="border-t border-error/30 pt-2 mt-2">
                <span className="text-error block">删除时间</span>
                <span className="text-error">{formatTime(selected.deleted_at)}</span>
              </div>
            )}
            <div className="border-t border-hairline pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selected.slug
                    ? `${window.location.origin}/textbook/${selected.slug}`
                    : `${window.location.origin}/node/${selected.node_ids?.[0] || ""}`);
                  toast.success("链接已复制");
                }}
                className="w-full py-1.5 text-xs rounded-lg border border-hairline text-muted hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
              >
                复制链接
              </button>
              {selected.slug && (
                <button
                  onClick={() => window.open(`/textbook/${selected.slug}`, "_blank")}
                  className="w-full mt-1 py-1.5 text-xs rounded-lg border border-hairline text-muted hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                >
                  前端预览 →
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-soft">选择章节查看属性</p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════ NODE EDITOR ════════════════════════ */

interface NodeRow { node_id: string; title: string; category: string; updated_at: string; }

function NodeEditor() {
  const [nodes, setNodes] = useState<NodeRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState(""); const [category, setCategory] = useState("");
  const [desc, setDesc] = useState(""); const [nodeData, setNodeData] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { listNodeDefinitions().then(setNodes); }, []);

  function loadNode(id: string) {
    setSelectedId(id);
    getNodeDefinition(id).then((row: any) => {
      if (row) { setTitle(row.title || ""); setCategory(row.category || ""); setDesc(row.description || ""); setNodeData(JSON.stringify(row.node_data, null, 2)); }
    });
  }

  async function handleSave() {
    if (!selectedId) return; setSaving(true);
    try {
      await upsertNodeDefinition(selectedId, title, category, desc, JSON.parse(nodeData));
      listNodeDefinitions().then(setNodes); toast.success("已保存");
    } catch (e: any) { toast.error("保存失败: " + e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex h-full">
      <div className="w-56 border-r border-hairline overflow-y-auto p-2 flex flex-col gap-0.5">
        <button onClick={() => { const id = prompt("node_id:"); if (id) { setSelectedId(id); setTitle(""); setCategory(""); setDesc(""); setNodeData("{}"); } }}
          className="w-full py-1.5 text-xs rounded-lg bg-hairline text-primary hover:bg-surface-cream-strong transition-colors cursor-pointer">+ 新建</button>
        {nodes.map((n) => (
          <button key={n.node_id} onClick={() => loadNode(n.node_id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedId === n.node_id ? "bg-hairline text-primary" : "hover:bg-surface-card text-body"}`}>
            <div className="font-medium truncate">{n.title || n.node_id}</div>
            <div className="text-[10px] text-muted-soft">{n.node_id}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedId ? (
          <>
            <div className="px-4 py-2 border-b border-hairline space-y-1.5">
              <div className="flex gap-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题"
                  className="flex-1 text-xs px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary" />
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="分类"
                  className="w-24 text-xs px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary" />
              </div>
              <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="描述"
                className="w-full text-xs px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary" />
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-1.5 text-xs rounded-lg bg-primary text-on-primary hover:bg-primary-active disabled:opacity-50 transition-colors cursor-pointer">
                {saving ? "..." : "保存"}
              </button>
            </div>
            <textarea value={nodeData} onChange={(e) => setNodeData(e.target.value)}
              placeholder="JSON 数据" className="flex-1 p-4 text-xs font-mono outline-none resize-none" />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-soft text-sm">选择节点编辑</div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════ TEXTBOOK EDITOR ════════════════════ */

interface SectionRow { section_id: string; title: string; updated_at: string; }

function TextbookEditor() {
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { listTextbookSections().then(setSections); }, []);

  function loadSection(id: string) {
    setSelectedId(id);
    getTextbookSection(id).then((row: any) => { if (row) { setTitle(row.title || ""); setContent(row.content || ""); } });
  }

  async function handleSave() {
    if (!selectedId) return; setSaving(true);
    try { await upsertTextbookSection(selectedId, title, content); listTextbookSections().then(setSections); toast.success("已保存"); }
    catch (e: any) { toast.error("保存失败: " + e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex h-full">
      <div className="w-56 border-r border-hairline overflow-y-auto p-2 flex flex-col gap-0.5">
        <button onClick={() => { const id = prompt("section_id:"); if (id) { setSelectedId(id); setTitle(""); setContent(""); } }}
          className="w-full py-1.5 text-xs rounded-lg bg-hairline text-primary hover:bg-surface-cream-strong transition-colors cursor-pointer">+ 新建</button>
        {sections.map((s) => (
          <button key={s.section_id} onClick={() => loadSection(s.section_id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedId === s.section_id ? "bg-hairline text-primary" : "hover:bg-surface-card text-body"}`}>
            <div className="font-medium truncate">{s.title || s.section_id}</div>
            <div className="text-[10px] text-muted-soft">{s.section_id}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        {selectedId ? (
          <>
            <div className="px-4 py-2 border-b border-hairline flex items-center gap-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题"
                className="flex-1 text-xs px-3 py-1.5 border border-hairline rounded-lg outline-none focus:border-primary" />
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-1.5 text-xs rounded-lg bg-primary text-on-primary hover:bg-primary-active disabled:opacity-50 transition-colors cursor-pointer">
                {saving ? "..." : "保存"}
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MDEditor value={content} onChange={(v) => setContent(v || "")} height="100%" preview="edit" visibleDragbar={false} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-soft text-sm">选择章节编辑</div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════ MEDIA LIBRARY ════════════════════ */

function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    try { const { listMediaFiles } = await import("../services/contentService"); setFiles(await listMediaFiles() || []); }
    catch { setFiles([]); }
  }

  async function handleUpload(e: any) {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
    try { await uploadMedia(file); loadFiles(); toast.success("上传成功"); }
    catch (err: any) { toast.error("上传失败: " + err.message); }
    finally { setUploading(false); }
  }

  function copyUrl(url: string) { navigator.clipboard.writeText(url); toast.success("已复制"); }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <label className="px-4 py-1.5 text-sm rounded-lg bg-hairline text-primary hover:bg-surface-cream-strong transition-colors cursor-pointer">
          {uploading ? "上传中..." : "上传文件"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        <span className="text-xs text-muted-soft">上传到 Supabase Storage media bucket</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {files.map((f: any, i: number) => (
          <div key={i} className="bg-canvas border border-hairline rounded-lg p-3 text-sm">
            <p className="font-medium truncate text-body text-xs">{f.name}</p>
            <button onClick={() => copyUrl(f.url)} className="text-xs text-primary hover:underline mt-1 cursor-pointer">复制链接</button>
          </div>
        ))}
        {files.length === 0 && <p className="col-span-4 text-muted-soft text-sm">暂无文件</p>}
      </div>
    </div>
  );
}

export default AdminContentPage;
