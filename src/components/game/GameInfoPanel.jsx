 import { CheckCircle2, Circle, XCircle, AlertTriangle, RefreshCw, RotateCcw, GripHorizontal } from "lucide-react";

function GameInfoPanel({
  layers,
  placedPieces,
  correctPieces,
  wrongPieces,
  validationDone,
  allCorrect,
  onRetryWrong,
  onResetAll,
}) {
  const totalCount = layers.length;
  const placedCount = placedPieces.size;
  const correctCount = correctPieces.size;
  const wrongCount = wrongPieces.size;
  const lockedCount = placedCount + correctCount + wrongCount;
  const allLocked = lockedCount >= totalCount;
  const firstPieceLocked = placedPieces.has(0) || correctPieces.has(0);

  /* status message */
  let statusMessage;
  if (validationDone && allCorrect) {
    statusMessage = "完美拼装！";
  } else if (validationDone && wrongCount > 0) {
    statusMessage = `${wrongCount} 个构件位置有误，可点击「调整」重新移动`;
  } else if (allLocked && !validationDone) {
    statusMessage = "正在验证...";
  } else if (!firstPieceLocked) {
    statusMessage = `将「${layers[0]?.name}」移动至金色原点`;
  } else {
    statusMessage = "移动构件至虚线框自动吸附，或自由放置后点击固定";
  }

  const showRetryButtons = validationDone && wrongCount > 0;

  return (
    <div className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-canvas rounded-xl border border-hairline shadow-sm p-5 h-full flex flex-col">
        <h2 className="text-lg font-medium font-sans text-ink tracking-tight mb-4">
          自由拼装
        </h2>

        {/* progress */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted">进度</span>
            <span className="font-semibold text-body-strong tabular-nums">
              {lockedCount} / {totalCount}
            </span>
          </div>
          <div className="w-full h-1.5 bg-hairline rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${totalCount > 0 ? (lockedCount / totalCount) * 100 : 0}%`,
                background: validationDone
                  ? allCorrect
                    ? "#5db872"
                    : `linear-gradient(90deg, #5db872 ${(correctCount / totalCount) * 100}%, #c64545 ${(correctCount / totalCount) * 100}%)`
                  : "#cc785c",
              }}
            />
          </div>
        </div>

        {/* status card */}
        <div
          className={`rounded-xl p-3 mb-4 text-xs ${
            validationDone && allCorrect
              ? "bg-success/10 text-success"
              : validationDone && wrongCount > 0
                ? "bg-error/10 text-error"
                : "bg-hairline/60 text-body"
          }`}
        >
          <div className="flex items-start gap-1.5">
            {validationDone && allCorrect ? (
              <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
            ) : validationDone && wrongCount > 0 ? (
              <AlertTriangle size={14} className="text-error flex-shrink-0 mt-0.5" />
            ) : !firstPieceLocked ? (
              <GripHorizontal size={14} className="text-primary flex-shrink-0 mt-0.5 animate-pulse" />
            ) : null}
            <span className="leading-relaxed">{statusMessage}</span>
          </div>
        </div>

        {/* action buttons */}
        {showRetryButtons && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={onRetryWrong}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-medium hover:bg-primary-active transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              调整
            </button>
            <button
              onClick={onResetAll}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-canvas border border-hairline text-body text-xs font-medium hover:bg-surface-soft transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              全部重来
            </button>
          </div>
        )}

        {/* layer list */}
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          构造层次
        </h3>
        <div className="space-y-1 flex-1 overflow-auto">
          {layers
            .map((layer, i) => ({ layer, i }))
            .reverse()
            .map(({ layer, i }) => {
              const isCorrect = correctPieces.has(i);
              const isWrong = wrongPieces.has(i);
              const isPlaced = placedPieces.has(i);

              let Icon;
              let iconClass;
              if (isCorrect) {
                Icon = CheckCircle2;
                iconClass = "text-success";
              } else if (isWrong) {
                Icon = XCircle;
                iconClass = "text-error";
              } else if (isPlaced) {
                Icon = CheckCircle2;
                iconClass = "text-muted-soft";
              } else {
                Icon = Circle;
                iconClass = "text-muted-soft";
              }

              return (
                <div
                  key={layer.name}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                >
                  <Icon size={13} className={`${iconClass} flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-body">
                      {layer.name}
                    </span>
                    <span className="text-primary tabular-nums">
                      {(layer.thickness * 1000).toFixed(0)} mm
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default GameInfoPanel;
