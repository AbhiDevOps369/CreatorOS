import StageNode from "./StageNode";
import { STAGES, STAGE_HINTS, stageIndex } from "../../utils/roleUtils";

/*
 * The production pipeline drawn as a road. Solid segments are traversed;
 * the segment feeding the current stage carries a slow animated dash — the
 * "work is moving" cue. Review stages are diamonds (the two gates).
 */
export default function PipelineRoad({ stage, editApproved = false, compact = false, framed = !compact, showHint = true }) {
  const activeIdx = stageIndex(stage);
  const deliveredNow = stage === "delivered";

  return (
    <div className={framed ? "card px-6 py-6" : ""}>
      <div className="flex items-start">
        {STAGES.map((s, i) => {
          const state = i < activeIdx || deliveredNow ? "complete" : i === activeIdx ? "active" : "upcoming";
          const approvedHere = s === "edit_review" && editApproved;
          return (
            <div key={s} className={`flex ${i === 0 ? "" : "flex-1"} items-start`}>
              {i > 0 && (
                <div className={`${compact ? "mt-4" : "mt-5"} h-[2px] min-w-4 flex-1 ${compact ? "-mx-1" : "-mx-3"} overflow-hidden rounded-full`}>
                  <div
                    className={`h-full w-full transition-colors duration-500 ${
                      i < activeIdx || deliveredNow
                        ? "bg-clay-500/70"
                        : i === activeIdx
                          ? "road-flow"
                          : "bg-ink-900/10"
                    }`}
                  />
                </div>
              )}
              <StageNode stage={s} state={state} approved={approvedHere} compact={compact} />
            </div>
          );
        })}
      </div>

      {showHint && !compact && (
        <p className="mt-5 border-t hairline pt-4 text-[13px] leading-relaxed text-ink-400">
          {stage === "edit_review" && editApproved
            ? "The reviewer has approved the edit — ready for the owner or a manager to deliver."
            : STAGE_HINTS[stage]}
        </p>
      )}
    </div>
  );
}
