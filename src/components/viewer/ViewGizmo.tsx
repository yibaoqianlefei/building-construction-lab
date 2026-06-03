import { memo } from "react";

interface ViewGizmoProps {
  viewTarget: string | null;
  onViewChange: (v: string) => void;
}

const FACES = [
  { v: "top",    label: "俯",   row: 0, col: 1, title: "俯视图" },
  { v: "left",   label: "左",   row: 1, col: 0, title: "左视图" },
  { v: "front",  label: "前",   row: 2, col: 1, title: "前视图" },
  { v: "right",  label: "右",   row: 1, col: 2, title: "右视图" },
  { v: "bottom", label: "仰",   row: 2, col: 0, title: "仰视图" },
  { v: "back",   label: "后",   row: 1, col: 3, title: "后视图" },
] as const;

function ViewGizmo({ viewTarget, onViewChange }: ViewGizmoProps) {
  return (
    <div
      className="absolute top-3 right-3 z-20 select-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-canvas border border-hairline rounded-xl px-1.5 py-1.5">
        {/* 3-row grid with spatial layout */}
        <div className="flex flex-col items-center gap-0.5">
          {/* Row 0: top */}
          <div className="flex justify-center">
            <FaceButton face={FACES[0]} active={viewTarget === FACES[0].v} onClick={onViewChange} />
          </div>

          {/* Row 1: left + right  + back*/}
          <div className="flex items-center gap-0.5">
            <FaceButton face={FACES[1]} active={viewTarget === FACES[1].v} onClick={onViewChange} />
            {/* center: front (primary) */}
            <FaceButton face={FACES[2]} active={viewTarget === FACES[2].v} onClick={onViewChange} primary />
            <FaceButton face={FACES[3]} active={viewTarget === FACES[3].v} onClick={onViewChange} />
            <FaceButton face={FACES[5]} active={viewTarget === FACES[5].v} onClick={onViewChange} />
          </div>

          {/* Row 2: bottom (left side of the cross) */}
          <div className="flex gap-0.5">
            <FaceButton face={FACES[4]} active={viewTarget === FACES[4].v} onClick={onViewChange} />
            {/* spacer + reset */}
            <ResetButton active={viewTarget === "default"} onClick={() => onViewChange("default")} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── individual direction button ── */
const FaceButton = memo(function FaceButton({
  face,
  active,
  onClick,
  primary,
}: {
  face: { v: string; label: string; title: string };
  active: boolean;
  onClick: (v: string) => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={() => onClick(face.v)}
      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center
        text-[10px] sm:text-xs font-medium transition-all duration-200
        ${active
          ? "bg-hairline text-primary scale-110 shadow-sm"
          : primary
            ? "text-body-strong hover:text-primary hover:bg-hairline border border-hairline"
            : "text-muted-soft hover:text-body hover:bg-surface-soft"}`}
      title={face.title}
    >
      {face.label}
    </button>
  );
});

/* ── reset / perspective button ── */
function ResetButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center
        text-[10px] font-medium transition-all duration-200
        ${active
          ? "bg-hairline text-primary scale-110 shadow-sm"
          : "text-muted-soft hover:text-primary hover:bg-hairline"}`}
      title="默认透视图"
    >
      <svg
        width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        className="sm:size-[14px]"
      >
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    </button>
  );
}

export default ViewGizmo;
