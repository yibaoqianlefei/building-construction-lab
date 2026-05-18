import { useState, memo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, RefreshCw } from "lucide-react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── memo'd card — removes transition-all conflict ── */
const SortableCard = memo(function SortableCard({ item, isCorrect, isWrong }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    touchAction: "none",
    willChange: isDragging ? "transform" : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-2xl p-4 border shadow-sm
        bg-white/80 backdrop-blur-sm
        ${isDragging ? "scale-[1.03] shadow-lg border-gold-400" : ""}
        ${isCorrect ? "border-green-400 bg-green-50/50" : ""}
        ${isWrong ? "border-red-300 bg-red-50/30 animate-pulse" : ""}
        ${!isCorrect && !isWrong && !isDragging ? "border-gray-200/50" : ""}
      `}
    >
      {!isDragging && (
        <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: item.layer.color }} />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm">{item.layer.name}</p>
        {!isDragging && (
          <p className="text-xs text-gray-500 truncate">{item.layer.material}</p>
        )}
      </div>
      <button {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical size={18} className="text-gray-400 hover:text-gold-500 transition-colors" />
      </button>
    </div>
  );
});

/* ── overlay shown while dragging ── */
function DragCard({ item }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gold-400 shadow-xl scale-105">
      <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: item.layer.color }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm">{item.layer.name}</p>
        <p className="text-xs text-gray-500 truncate">{item.layer.material}</p>
      </div>
      <GripVertical size={18} className="text-gold-500" />
    </div>
  );
}

function SortChallenge({ layers, onFeedback }) {
  const [items, setItems] = useState(() => {
    let shuffled = shuffle(layers.map((l, i) => ({ id: `layer-${i}`, layer: l, correctIndex: i })));
    while (shuffled.every((s, i) => s.correctIndex === i)) {
      shuffled = shuffle(shuffled);
    }
    return shuffled;
  });

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  const handleDragStart = useCallback((event) => {
    const item = items.find((i) => i.id === event.active.id);
    setActiveItem(item);
    document.body.style.overflow = "hidden";
  }, [items]);

  const handleDragEnd = useCallback((event) => {
    setActiveItem(null);
    document.body.style.overflow = "";
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIdx = prev.findIndex((i) => i.id === active.id);
        const newIdx = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  }, []);

  function handleSubmit() {
    const correctIndices = [];
    const incorrectIndices = [];
    let correct = 0;
    items.forEach((item, pos) => {
      if (item.correctIndex === pos) { correct++; correctIndices.push(item.correctIndex); }
      else { incorrectIndices.push(item.correctIndex); }
    });
    const s = Math.round((correct / items.length) * 100);
    setScore(s);
    setResults({ correctIndices, incorrectIndices });
    setSubmitted(true);
    onFeedback?.({ correctIndices, incorrectIndices });
  }

  function handleReset() {
    let shuffled = shuffle(layers.map((l, i) => ({ id: `layer-${i}`, layer: l, correctIndex: i })));
    while (shuffled.every((s, i) => s.correctIndex === i)) {
      shuffled = shuffle(shuffled);
    }
    setItems(shuffled);
    setSubmitted(false);
    setScore(null);
    setResults(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">请按正确顺序排列构造层</h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          重新挑战
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 flex-1">
            {items.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                isCorrect={submitted && results?.correctIndices?.includes(item.correctIndex)}
                isWrong={submitted && results?.incorrectIndices?.includes(item.correctIndex)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeItem ? <DragCard item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-6">
        {score !== null && (
          <div className="mb-4 text-center">
            <p className="text-3xl font-bold text-gold-600">{score} 分</p>
            <p className="text-xs text-gray-400 mt-1">
              {score === 100 ? "全部正确！" : `答对 ${Math.round(score / 100 * items.length)} / ${items.length} 题`}
            </p>
          </div>
        )}
        <button
          onClick={submitted ? handleReset : handleSubmit}
          className={`w-full py-3 rounded-full text-base font-medium transition-all cursor-pointer ${
            submitted
              ? "border border-gold-500 text-gold-600 hover:bg-gold-50"
              : "bg-gold-500 text-white hover:bg-gold-600"
          }`}
        >
          {submitted ? (
            <span className="flex items-center justify-center gap-2"><RefreshCw size={18} /> 重新挑战</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Check size={18} /> 验证答案</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default SortChallenge;
