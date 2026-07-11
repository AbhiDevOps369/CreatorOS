import { STAGE_LABELS } from "../../utils/roleUtils";

const ICONS = {
  created: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 1.5v3M7.5 10.5v3M1.5 7.5h3M10.5 7.5h3M3.3 3.3l2.1 2.1M9.6 9.6l2.1 2.1M11.7 3.3L9.6 5.4M5.4 9.6l-2.1 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  footage_collection: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.2" y="3.5" width="8.6" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.8 6.8l3.4-2v5.4l-3.4-2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  footage_review: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M1.2 7.5S3.5 3.4 7.5 3.4s6.3 4.1 6.3 4.1-2.3 4.1-6.3 4.1S1.2 7.5 1.2 7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="7.5" cy="7.5" r="1.9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  editing: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="3.6" cy="4" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3.6" cy="11" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.2 5.2l8 8.2M5.2 9.8l8-8.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  edit_review: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M1.2 7.5S3.5 3.4 7.5 3.4s6.3 4.1 6.3 4.1-2.3 4.1-6.3 4.1S1.2 7.5 1.2 7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.8 7.6l1.3 1.3 2.2-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  delivered: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M2.5 13V2.2M2.5 2.5c1.8-1 3.4-1 5 0s3.2 1 5 0v6c-1.8 1-3.4 1-5 0s-3.2-1-5 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const check = (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
    <path d="M2.5 7l3 3 5-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/*
 * state: "complete" | "active" | "upcoming"
 * The two review stages render as diamonds — they are the gates of the pipeline.
 */
export default function StageNode({ stage, state, approved = false, compact = false }) {
  const isGate = stage === "footage_review" || stage === "edit_review";
  const done = state === "complete";
  const active = state === "active";

  const shapeTone = done
    ? stage === "delivered" || approved
      ? "bg-sage-500 text-white"
      : "bg-clay-500 text-white"
    : active
      ? approved
        ? "bg-sage-500 text-white animate-glow"
        : "bg-white text-clay-600 ring-2 ring-clay-500 animate-glow"
      : "bg-bone-100 text-ink-300 ring-1 ring-ink-900/10";

  const size = compact ? "size-8" : "size-10";

  return (
    <div className={`flex ${compact ? "w-16" : "w-24"} flex-col items-center gap-2`}>
      <div className={`grid ${size} place-items-center`}>
        <div
          className={`grid place-items-center transition-all duration-300 ${shapeTone}
            ${isGate ? `${compact ? "size-6" : "size-8"} rotate-45 rounded-md` : `${size} rounded-full`}`}
        >
          <span className={isGate ? "-rotate-45" : ""}>{done || (active && approved) ? check : ICONS[stage]}</span>
        </div>
      </div>
      {!compact && (
        <span
          className={`text-center text-[10.5px] font-semibold uppercase leading-tight tracking-wider
            transition-colors duration-300
            ${active ? (approved ? "text-sage-700" : "text-clay-600") : done ? "text-ink-600" : "text-ink-300"}`}
        >
          {STAGE_LABELS[stage]}
        </span>
      )}
    </div>
  );
}
