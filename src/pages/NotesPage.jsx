import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, StickyNote, Columns3, X, Check } from "lucide-react";
import { getNotes, updateNote, deleteNote } from "../services/noteService";

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editText, setEditText] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);

  function refresh() {
    setNotes(getNotes());
  }

  useEffect(() => refresh(), []);

  function handleSaveText(id) {
    updateNote(id, { text: editText });
    setExpandedId(null);
    refresh();
  }

  function handleDelete(id) {
    deleteNote(id);
    refresh();
  }

  function toggleCompare(id) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  const filtered = filter
    ? notes.filter((n) => n.nodeTitle.includes(filter))
    : notes;

  const compareNotes = notes.filter((n) => compareIds.includes(n.id));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">我的笔记</h1>
          <p className="text-gray-500 text-sm mt-1.5">截图保存、添加备注、对比分析</p>
        </motion.div>

        {notes.length === 0 ? (
          <div className="text-center py-20">
            <StickyNote size={40} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-gray-500">暂无笔记</p>
            <p className="text-gray-400 text-sm mt-1">在节点页面截取第一张图吧</p>
          </div>
        ) : (
          <>
            {compareNotes.length > 0 && (
              <div className="mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">对比视图 ({compareNotes.length})</h2>
                  <button onClick={() => setCompareIds([])} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                    清除
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto">
                  {compareNotes.map((n) => (
                    <div key={n.id} className="flex-shrink-0 w-64">
                      <img src={n.image} alt={n.nodeTitle} className="w-full rounded-lg border border-gray-200" />
                      <p className="text-xs text-gray-500 mt-1 text-center">{n.nodeTitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <input
                type="text"
                placeholder="按节点标题筛选..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gold-400 transition-colors bg-white/80"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`bg-white/70 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    compareIds.includes(note.id)
                      ? "border-gold-500 shadow-md shadow-gold-500/10"
                      : "border-gray-200/50"
                  }`}
                >
                  <img
                    src={note.image}
                    alt={note.nodeTitle}
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => setPreviewImg(note.image)}
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{note.nodeTitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(note.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCompare(note.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer ${
                            compareIds.includes(note.id) ? "bg-gold-100 text-gold-600" : "text-gray-400 hover:text-gold-600"
                          }`}
                          title="对比"
                        >
                          <Columns3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {expandedId === note.id ? (
                      <div className="mt-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 resize-none focus:outline-none focus:border-gold-400 bg-white/80"
                          rows={3}
                          placeholder="添加备注..."
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveText(note.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold-500 text-white text-xs font-medium hover:bg-gold-600 transition-colors cursor-pointer"
                          >
                            <Check size={12} /> 保存
                          </button>
                          <button
                            onClick={() => setExpandedId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setExpandedId(note.id);
                          setEditText(note.text || "");
                        }}
                        className="mt-3"
                      >
                        {note.text ? (
                          <p className="text-xs text-gray-500 line-clamp-2">{note.text}</p>
                        ) : (
                          <p className="text-xs text-gray-300 italic cursor-pointer hover:text-gold-600 transition-colors">添加备注...</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <AnimatePresence>
          {previewImg && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewImg(null)}
            >
              <button
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
                onClick={() => setPreviewImg(null)}
              >
                <X size={20} />
              </button>
              <img src={previewImg} alt="预览" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NotesPage;
