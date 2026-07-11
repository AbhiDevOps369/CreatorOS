import { STAGE_LABELS } from "../../utils/roleUtils";

const STAGE_TONES = {
  created: "bg-bone-200 text-ink-600",
  footage_collection: "bg-ochre-100 text-ochre-700",
  footage_review: "bg-ochre-100 text-ochre-700 ring-1 ring-ochre-500/30",
  editing: "bg-clay-100 text-clay-700",
  edit_review: "bg-clay-100 text-clay-700 ring-1 ring-clay-500/30",
  delivered: "bg-sage-100 text-sage-700",
};

const ROLE_TONES = {
  owner: "bg-ink-900 text-bone-50",
  manager: "bg-ink-900/80 text-bone-50",
  reviewer: "bg-clay-50 text-clay-700 ring-1 ring-clay-500/25",
  contributor: "bg-bone-200 text-ink-700",
};

const GENERIC_TONES = {
  neutral: "bg-bone-200 text-ink-600",
  accent: "bg-clay-100 text-clay-700",
  success: "bg-sage-100 text-sage-700",
  warning: "bg-ochre-100 text-ochre-700",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold
        uppercase tracking-wider whitespace-nowrap ${GENERIC_TONES[tone] || GENERIC_TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export function StageBadge({ stage, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold
        uppercase tracking-wider whitespace-nowrap ${STAGE_TONES[stage] || STAGE_TONES.created} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {STAGE_LABELS[stage] || stage}
    </span>
  );
}

export function RoleBadge({ role, className = "" }) {
  if (!role) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold
        uppercase tracking-wider whitespace-nowrap ${ROLE_TONES[role] || GENERIC_TONES.neutral} ${className}`}
    >
      {role}
    </span>
  );
}
