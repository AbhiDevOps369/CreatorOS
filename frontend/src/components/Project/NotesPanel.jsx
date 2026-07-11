import { useState } from "react";
import api, { errorMessage } from "../../api/api";
import Button from "../UI/Button";
import { TextArea } from "../UI/Input";
import { canCreateNote, isManagerial } from "../../utils/roleUtils";

const timeAgo = (iso) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/*
 * Project feedback feed. Owner/manager/reviewer write direction; contributors
 * acknowledge it — the acknowledgedBy list is the "seen" receipt.
 */
export default function NotesPanel({ projectId, notes, usersById, myRole, meId, onChanged }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api.post(`/projects/${projectId}/notes`, { content: draft.trim() });
      setDraft("");
      await onChanged?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const acknowledge = async (noteId) => {
    setError("");
    try {
      await api.post(`/projects/${projectId}/notes/${noteId}/acknowledge`);
      await onChanged?.();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async (noteId) => {
    setError("");
    try {
      await api.delete(`/projects/${projectId}/notes/${noteId}`);
      await onChanged?.();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const sorted = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <section className="card p-5">
      <h2 className="text-[15px] font-semibold text-ink-900">Notes</h2>

      {canCreateNote(myRole) && (
        <form onSubmit={post} className="mt-3">
          <TextArea
            rows={2}
            placeholder="Leave direction for the crew…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" type="submit" loading={busy} disabled={!draft.trim()}>
              Post note
            </Button>
          </div>
        </form>
      )}

      {error && <p className="mt-2 text-[12px] text-red-700">{error}</p>}

      <ul className="mt-4 space-y-4">
        {sorted.length === 0 && (
          <li className="text-[13px] italic text-ink-300">No notes yet.</li>
        )}
        {sorted.map((n) => {
          const author = usersById[n.createdBy];
          const acked = n.acknowledgedBy?.includes(meId);
          // backend: contributors never delete; reviewers delete their own; owner/manager delete any
          const canDelete =
            myRole !== "contributor" && (n.createdBy === meId || isManagerial(myRole));
          return (
            <li key={n._id} className="group border-t hairline pt-3.5 first:border-0 first:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-ink-900">{author?.name || "Unknown"}</span>
                <span className="text-[11px] text-ink-300">{timeAgo(n.createdAt)}</span>
                {canDelete && (
                  <button
                    onClick={() => remove(n._id)}
                    className="ml-auto text-[11px] text-ink-300 opacity-0 cursor-pointer transition-all
                      duration-200 hover:text-red-700 group-hover:opacity-100"
                  >
                    delete
                  </button>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap text-ink-700">{n.content}</p>
              <div className="mt-2 flex items-center gap-3">
                {myRole === "contributor" &&
                  (acked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sage-700">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                        <path d="M1.5 5.5l2.5 2.5 4.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledge(n._id)}
                      className="text-[11px] font-semibold uppercase tracking-wider text-clay-600 cursor-pointer
                        transition-colors duration-200 hover:text-clay-700"
                    >
                      Acknowledge
                    </button>
                  ))}
                {n.acknowledgedBy?.length > 0 && (
                  <span className="text-[11px] text-ink-300">
                    seen by {n.acknowledgedBy.length}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
