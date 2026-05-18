import { useState, memo, useMemo, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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

/* ── helpers ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HW_ACCEL = {
  transform: "translate3d(0,0,0)",
  backfaceVisibility: "hidden",
  perspective: "1000px",
};

/* ── memo'd sortable card ── */
const SortableCard = memo(function SortableCard({
  item,
  isCorrect,
  isWrong,
  isDraggingAny,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, animateLayoutChanges: () => false });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggingAny ? "none" : transition,
    zIndex: isDragging ? 50 : 0,
    willChange: isDragging ? "transform" : "auto",
    isolation: isDragging ? "isolate" : undefined,
    ...HW_ACCEL,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-2xl p-4 border shadow-sm
        bg-white/80 backdrop-blur-sm
        ${isDragging ? "scale-[1.03] shadow-lg border-gold-400" : ""}
        ${!isDragging && isCorrect ? "border-green-400 bg-green-50/50" : ""}
        ${!isDragging && isWrong ? "border-red-300 bg-red-50/30 animate-pulse" : ""}
        ${!isCorrect && !isWrong && !isDragging ? "border-gray-200/50" : ""}
      `}
    >
      <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: item.layer.color }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm">{item.layer.name}</p>
        <p className="text-xs text-gray-500 truncate">{item.layer.material}</p>
      </div>
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing touch-none p-1"
      >
        <GripVertical size={18} className="text-gray-400 hover:text-gold-500 transition-colors" />
      </button>
    </div>
  );
});

/* ── drag overlay ── */
function DragCard({ item }) {
  return (
    <div
      style={HW_ACCEL}
      className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gold-400 shadow-xl scale-105"
    >
      <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: item.layer.color }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm">{item.layer.name}</p>
        <p className="text-xs text-gray-500 truncate">{item.layer.material}</p>
      </div>
      <GripVertical size={18} className="text-gold-500" />
    </div>
  );
}

/* ── main component ── */
function SortChallenge({ layers, onFeedback, onDragChange }) {
  const [draggingId, setDraggingId] = useState(null);
  const [items, setItems] = useState(() => {
    let s = shuffle(layers.map((l, i) => ({ id: `l-${i}`, layer: l, correctIndex: i })));
    while (s.every((x, i) => x.correctIndex === i)) s = shuffle(s);
    return s;
  });
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState(null);

  const itemIds = useMemo(() => items.map((i) => i.id), [items]);
  const activeItem = useMemo(
    () => draggingId ? items.find((i) => i.id === draggingId) : null,
    [draggingId, items],
  );
  const isDragging = draggingId !== null;

  /* notify parent when dragging state changes */
  useEffect(() => {
    onDragChange?.(isDragging);
  }, [isDragging, onDragChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback(({ active }) => {
    setDraggingId(active.id);
    document.body.style.overflow = "hidden";
  }, []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setDraggingId(null);
    document.body.style.overflow = "";
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const o = prev.findIndex((i) => i.id === active.id);
        const n = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, o, n);
      });
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const ci = [], wi = [];
    let c = 0;
    items.forEach((item, pos) => {
      if (item.correctIndex === pos) { c++; ci.push(item.correctIndex); }
      else { wi.push(item.correctIndex); }
    });
    setScore(Math.round((c / items.length) * 100));
    setResults({ correctIndices: ci, incorrectIndices: wi });
    setSubmitted(true);
    onFeedback?.({ correctIndices: ci, incorrectIndices: wi });
  }, [items, onFeedback]);

  const handleReset = useCallback(() => {
    let s = shuffle(layers.map((l, i) => ({ id: `l-${i}`, layer: l, correctIndex: i })));
    while (s.every((x, i) => x.correctIndex === i)) s = shuffle(s);
    setItems(s);
    setSubmitted(false);
    setScore(null);
    setResults(null);
  }, [layers]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">请按正确顺序排列构造层</h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> 重新挑战
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 flex-1">
            {items.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                isCorrect={submitted && results?.correctIndices?.includes(item.correctIndex)}
                isWrong={submitted && results?.incorrectIndices?.includes(item.correctIndex)}
                isDraggingAny={isDragging}
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
