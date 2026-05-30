import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SectionTree from "../components/admin/SectionTree";
import SectionEditor from "../components/admin/SectionEditor";
import {
  listTextbookSections,
  listNodeDefinitions,
  getTextbookSection,
  getNodeDefinition,
  upsertTextbookSection,
  upsertNodeDefinition,
  deleteTextbookSection,
  deleteNodeDefinition,
  listAllSections,
  createSection,
  deleteSection,
  softDeleteSection,
  restoreSection,
} from "../services/contentService";

interface SectionRow {
  section_id: string;
  title: string;
  updated_at: string;
}

interface NodeRow {
  node_id: string;
  title: string;
  category: string;
  updated_at: string;
}

const TABS = [
  { id: "textbook", label: "教材章节" },
  { id: "nodes", label: "节点定义" },
  { id: "sections", label: "章节编辑" },
  { id: "media", label: "媒体库" },
];

function AdminContentPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("textbook");

  if (!profile || (profile as any).role !== "developer") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">仅开发者可访问此页面</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col h-screen">
      <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-6">
        <h2 className="text-base font-semibold text-gray-800">内容管理</h2>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.id ? "bg-rose-100 text-rose-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "textbook" ? <TextbookEditor /> : tab === "nodes" ? <NodeEditor /> : tab === "sections" ? <SectionManager /> : <MediaLibrary />}
      </div>
    </div>
  );
}

/* ── Section Manager ── */
function SectionManager() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; undoId: string | null } | null>(null);

  useEffect(() => {
    loadSections();
  }, [showDeleted]);

  async function loadSections() {
    setLoading(true);
    const data = await listAllSections(showDeleted);
    setSections(data || []);
    setLoading(false);
  }

  /* ── toast ── */
  function showToast(message: string, undoId: string | null) {
    const id = Date.now().toString();
    setToast({ id, message, undoId });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  }

  async function handleUndoDelete(sectionId: string) {
    try {
      await restoreSection(sectionId);
      setToast(null);
      await loadSections();
    } catch (e: any) {
      alert("恢复失败: " + e.message);
    }
  }

  async function handleAddChild(parent: any) {
    const moduleId = parent?.module_id || null;
    const parentId = parent?.id || null;
    const title = prompt("输入章节标题：");
    if (!title) return;
    try {
      const newSection = await createSection({
        title,
        module_id: moduleId,
        parent_id: parentId,
        sort_order: 0,
        available: false,
        node_ids: [],
      });
      await loadSections();
      setSelectedSection(newSection);
    } catch (e: any) {
      alert("创建失败: " + e.message);
    }
  }

  /* soft-delete with toast */
  async function handleDelete(sectionId: string) {
    try {
      await softDeleteSection(sectionId);
      if (selectedSection?.id === sectionId) {
        setSelectedSection((prev: any) => prev ? { ...prev, deleted_at: new Date().toISOString() } : null);
      }
      await loadSections();
      showToast("章节已移至回收站", sectionId);
    } catch (e: any) {
      alert("删除失败: " + e.message);
    }
  }

  /* restore from editor */
  async function handleRestore(sectionId: string) {
    try {
      await restoreSection(sectionId);
      setSelectedSection(null);
      await loadSections();
    } catch (e: any) {
      alert("恢复失败: " + e.message);
    }
  }

  /* ── fetch textbook content for a section ── */
  async function fetchTextbookContent(sec) {
    /* sec.id is the file-based section ID e.g. "roof-membrane" */
    if (!sec.hasTextbook && !sec.content) return "";
    const contentId = typeof sec.content === "string" && sec.content
      ? sec.content
      : sec.id;
    try {
      const res = await fetch(`/textbook/${contentId}/content.md`);
      if (!res.ok) return "";
      return await res.text();
    } catch {
      return "";
    }
  }

  async function handleImport() {
    if (!confirm("将从现有代码文件导入所有模块的章节数据到数据库，确认？")) return;
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
            const children = sec.children || [];

            /* fetch textbook content if this section has it */
            const textbookContent = await fetchTextbookContent(sec);

            const parentData: any = {
              title: sec.title,
              description: sec.description || "",
              module_id: ms.module,
              parent_id: null,
              sort_order: i,
              available: sec.available !== false,
              node_ids: sec.nodeIds || [],
              content: textbookContent,
              slug: sec.id || null,
            };
            const created = await createSection(parentData);
            count++;

            /* create children */
            for (let j = 0; j < children.length; j++) {
              const child = children[j];
              const childContent = await fetchTextbookContent(child);
              await createSection({
                title: child.title,
                description: child.description || "",
                module_id: ms.module,
                parent_id: created.id,
                sort_order: j,
                available: child.available !== false,
                node_ids: child.nodeIds || [],
                content: childContent,
                slug: child.id || null,
              });
              count++;
            }
          }
        } catch {
          /* module file may not exist */
        }
      }
      alert(`导入完成：${count} 个章节`);
      await loadSections();
    } catch (e: any) {
      alert("导入失败: " + e.message);
    } finally {
      setImporting(false);
    }
  }

  /* ── re-import textbook content for ALL existing sections ── */
  async function handleReimportContent() {
    if (!confirm("将从代码文件重新读取教材文本并更新所有章节的 content 字段，确认？")) return;
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

      let fixed = 0;
      const { updateSection } = await import("../services/contentService");

      for (const ms of moduleSections) {
        try {
          const mod = await import(/* @vite-ignore */ ms.file);
          const secs = mod.default || [];

          /* fetch all existing DB sections for this module */
          const existing = sections.filter((s) => s.module_id === ms.module && s.parent_id === null);
          const existingChildren = sections.filter((s) => s.module_id === ms.module && s.parent_id !== null);

          for (let i = 0; i < secs.length; i++) {
            const sec = secs[i];
            const content = await fetchTextbookContent(sec);
            /* find matching DB row by title */
            const match = existing.find((s) => s.title === sec.title);
            if (match && content) {
              await updateSection(match.id, { content });
              fixed++;
            }
            /* fix children too */
            const children = sec.children || [];
            for (let j = 0; j < children.length; j++) {
              const child = children[j];
              const childContent = await fetchTextbookContent(child);
              const childMatch = existingChildren.find((s) => s.title === child.title);
              if (childMatch && childContent) {
                await updateSection(childMatch.id, { content: childContent });
                fixed++;
              }
            }
          }
        } catch {
          /* ok */
        }
      }
      alert(`修复完成：${fixed} 个章节的教材文本已更新`);
      await loadSections();
    } catch (e: any) {
      alert("修复失败: " + e.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex h-full relative">
      {!treeCollapsed && (
        <div className="w-72 flex-shrink-0 border-r border-gray-100">
          <div className="px-2 py-1 border-b border-gray-100 flex items-center gap-2">
            <label className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => {
                  setShowDeleted(e.target.checked);
                  if (!e.target.checked) setSelectedSection(null);
                }}
                className="accent-rose-500 w-3 h-3"
              />
              回收站
            </label>
            <button
              onClick={() => setTreeCollapsed(true)}
              className="ml-auto p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="折叠章节树"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
          <SectionTree
            sections={sections}
            selectedId={selectedSection?.id}
            onSelect={setSelectedSection}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onImport={handleImport}
            onReimport={handleReimportContent}
            loading={loading || importing}
          />
        </div>
      )}
      {treeCollapsed && (
        <button
          onClick={() => setTreeCollapsed(false)}
          className="flex-shrink-0 w-8 flex items-start justify-center pt-2 border-r border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          title="展开章节树"
        >
          <PanelLeftOpen size={14} className="text-gray-400" />
        </button>
      )}
      <SectionEditor
        section={selectedSection}
        onSaved={loadSections}
        onRefresh={loadSections}
        onRestore={handleRestore}
      />

      {/* ── toast notification ── */}
      {toast && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-3 px-5 py-2.5
          bg-gray-800 text-white text-sm rounded-xl shadow-xl
          animate-[slideUp_0.25s_ease-out]">
          <span>{toast.message}</span>
          {toast.undoId && (
            <button
              onClick={() => handleUndoDelete(toast.undoId!)}
              className="text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
            >
              撤销
            </button>
          )}
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-300 ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Textbook Editor ── */
function TextbookEditor() {
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listTextbookSections().then(setSections);
  }, []);

  function loadSection(id: string) {
    setSelectedId(id);
    getTextbookSection(id).then((row: any) => {
      if (row) {
        setTitle(row.title || "");
        setContent(row.content || "");
      }
    });
  }

  function newSection() {
    const id = prompt("输入 section_id（如 roof-membrane）：");
    if (!id) return;
    setSelectedId(id);
    setTitle("");
    setContent("");
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await upsertTextbookSection(selectedId, title, content);
      listTextbookSections().then(setSections);
      alert("保存成功");
    } catch (e: any) {
      alert("保存失败: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || !confirm("确认删除此章节？")) return;
    await deleteTextbookSection(selectedId);
    setSelectedId(null);
    setTitle("");
    setContent("");
    listTextbookSections().then(setSections);
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-100 overflow-y-auto p-3 flex flex-col gap-1">
        <button onClick={newSection} className="w-full py-1.5 text-sm rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
          + 新建章节
        </button>
        {sections.map((s) => (
          <button
            key={s.section_id}
            onClick={() => loadSection(s.section_id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedId === s.section_id ? "bg-rose-50 text-rose-700" : "hover:bg-gray-50 text-gray-600"
            }`}
          >
            <div className="font-medium truncate">{s.title || s.section_id}</div>
            <div className="text-xs text-gray-400">{s.section_id}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {selectedId ? (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="章节标题"
                className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-rose-300"
              />
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-1.5 text-sm rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-colors">
                {saving ? "保存中..." : "保存"}
              </button>
              <button onClick={handleDelete}
                className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 transition-colors">
                删除
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height="100%"
                preview="edit"
                visibleDragbar={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            选择一个章节开始编辑
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Node Editor ── */
function NodeEditor() {
  const [nodes, setNodes] = useState<NodeRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [nodeData, setNodeData] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listNodeDefinitions().then(setNodes);
  }, []);

  function loadNode(id: string) {
    setSelectedId(id);
    getNodeDefinition(id).then((row: any) => {
      if (row) {
        setTitle(row.title || "");
        setCategory(row.category || "");
        setDescription(row.description || "");
        setNodeData(JSON.stringify(row.node_data, null, 2));
      }
    });
  }

  function newNode() {
    const id = prompt("输入 node_id（如 ext-wall-01）：");
    if (!id) return;
    setSelectedId(id);
    setTitle("");
    setCategory("");
    setDescription("");
    setNodeData("{}");
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const parsed = JSON.parse(nodeData);
      await upsertNodeDefinition(selectedId, title, category, description, parsed);
      listNodeDefinitions().then(setNodes);
      alert("保存成功");
    } catch (e: any) {
      alert("保存失败: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || !confirm("确认删除此节点？")) return;
    await deleteNodeDefinition(selectedId);
    setSelectedId(null);
    listNodeDefinitions().then(setNodes);
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-100 overflow-y-auto p-3 flex flex-col gap-1">
        <button onClick={newNode} className="w-full py-1.5 text-sm rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
          + 新建节点
        </button>
        {nodes.map((n) => (
          <button
            key={n.node_id}
            onClick={() => loadNode(n.node_id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedId === n.node_id ? "bg-rose-50 text-rose-700" : "hover:bg-gray-50 text-gray-600"
            }`}
          >
            <div className="font-medium truncate">{n.title || n.node_id}</div>
            <div className="text-xs text-gray-400">{n.node_id}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedId ? (
          <>
            <div className="px-4 py-3 border-b border-gray-100 space-y-2">
              <div className="flex gap-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题"
                  className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-rose-300" />
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="分类"
                  className="w-32 text-sm px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-rose-300" />
              </div>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述"
                className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-rose-300" />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-1.5 text-sm rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-colors">
                  {saving ? "保存中..." : "保存"}
                </button>
                <button onClick={handleDelete}
                  className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 transition-colors">
                  删除
                </button>
              </div>
            </div>
            <textarea value={nodeData} onChange={(e) => setNodeData(e.target.value)}
              placeholder="JSON 节点数据..." className="flex-1 p-4 text-sm font-mono outline-none resize-none" />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            选择一个节点开始编辑
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Media Library ── */
function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const { listMediaFiles } = await import("../services/contentService");
      const data = await listMediaFiles();
      setFiles(data || []);
    } catch { setFiles([]); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadMedia } = await import("../services/contentService");
      await uploadMedia(file);
      loadFiles();
    } catch (err: any) { alert("上传失败: " + err.message); }
    finally { setUploading(false); }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <label className="px-4 py-1.5 text-sm rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer">
          {uploading ? "上传中..." : "上传文件"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        <span className="text-xs text-gray-400">
          上传到 Supabase Storage media bucket，URL 自动生成
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {files.map((f: any, i: number) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 text-sm">
            <p className="font-medium truncate text-gray-700">{f.name}</p>
            <button onClick={() => copyUrl(f.url)} className="text-xs text-rose-500 hover:underline mt-1">
              {copied === f.url ? "已复制!" : "复制链接"}
            </button>
          </div>
        ))}
        {files.length === 0 && (
          <p className="col-span-4 text-gray-400 text-sm">暂无文件，请上传</p>
        )}
      </div>
    </div>
  );
}

export default AdminContentPage;
