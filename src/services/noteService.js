const STORAGE_KEY = "construction_notes";
const MAX_NOTES = 30;

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNotes() {
  return getAll();
}

export function saveNote(note) {
  const notes = getAll();
  if (notes.length >= MAX_NOTES) {
    notes.shift();
  }
  notes.push({
    id: crypto.randomUUID(),
    nodeId: note.nodeId,
    nodeTitle: note.nodeTitle,
    image: note.image,
    text: note.text || "",
    createdAt: Date.now(),
  });
  saveAll(notes);
  return notes;
}

export function updateNote(id, updates) {
  const notes = getAll();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return notes;
  notes[idx] = { ...notes[idx], ...updates };
  saveAll(notes);
  return notes;
}

export function deleteNote(id) {
  const notes = getAll().filter((n) => n.id !== id);
  saveAll(notes);
  return notes;
}
