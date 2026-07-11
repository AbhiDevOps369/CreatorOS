import { Link } from "react-router-dom";

const STATUS_TONES = {
  todo: "bg-ink-300",
  in_progress: "bg-ochre-500",
  done: "bg-sage-500",
};

export default function TaskCard({ projectId, task, assigneeName }) {
  const attachmentCount = task.attachments?.length || 0;

  return (
    <Link
      to={`/projects/${projectId}/tasks/${task._id}`}
      className="card group block p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`size-2 shrink-0 rounded-full ${STATUS_TONES[task.status] || STATUS_TONES.todo}`} aria-hidden />
            <h3 className="truncate text-[15px] font-semibold text-ink-900 transition-colors duration-200 group-hover:text-clay-600">
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="mt-1.5 line-clamp-2 pl-4 text-[13px] leading-relaxed text-ink-400">
              {task.description}
            </p>
          )}
        </div>
        <svg
          className="mt-1 shrink-0 text-ink-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-clay-500"
          width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
        >
          <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3 pl-4 text-[12px] text-ink-400">
        {assigneeName ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-clay-100 text-[9px] font-bold text-clay-700">
              {assigneeName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
            {assigneeName}
          </span>
        ) : (
          <span className="italic text-ink-300">Unassigned</span>
        )}
        {attachmentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path d="M9.5 5L5.8 8.7a2.3 2.3 0 01-3.2-3.2L6.7 1.4a1.5 1.5 0 012.1 2.1L4.9 7.4a.7.7 0 01-1-1l3.4-3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            {attachmentCount} deliverable{attachmentCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </Link>
  );
}
