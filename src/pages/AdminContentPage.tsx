import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useAuth } from "../contexts/AuthContext";
import {
  listTextbookSections,
  listNodeDefinitions,
  getTextbookSection,
  getNodeDefinition,
  upsertTextbookSection,
  upsertNodeDefinition,
  deleteTextbookSection,
  deleteNodeDefinition,
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
        {tab === "textbook" ? <TextbookEditor /> : tab === "nodes" ? <NodeEditor /> : <MediaLibrary />}
      </div>
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
