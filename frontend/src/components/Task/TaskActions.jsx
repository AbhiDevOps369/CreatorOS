import { useState } from "react";
import api, { errorMessage } from "../../api/api";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Input, { TextArea } from "../UI/Input";
import {
  canSubmitFootage,
  canApproveFootage,
  canRejectFootage,
  canSubmitEdit,
  canApproveEdit,
  canRequestChanges,
} from "../../utils/roleUtils";

/*
 * Role×stage-aware pipeline controls for a task. Buttons only render when the
 * caller's role and the project's current stage make that transition legal —
 * the same transition map the backend enforces.
 */
export default function TaskActions({ projectId, task, role, stage, editApproved, incompleteSubtasks = 0, onChanged }) {
  const [submitKind, setSubmitKind] = useState(null); // "footage" | "edit" | null
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(null); // action name while a call is in flight
  const [error, setError] = useState("");

  const act = async (action, body) => {
    setBusy(action);
    setError("");
    try {
      await api.post(`/projects/${projectId}/tasks/${task._id}/${action}`, body);
      setSubmitKind(null);
      setUrl("");
      setMessage("");
      await onChanged?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const submitDeliverable = (e) => {
    e.preventDefault();
    act(submitKind === "footage" ? "submit-footage" : "submit-edit", { url, message });
  };

  const editBlocked = incompleteSubtasks > 0;

  const buttons = [];
  if (canSubmitFootage(role, stage)) {
    buttons.push(
      <Button key="sf" onClick={() => setSubmitKind("footage")}>
        Submit footage
      </Button>
    );
  }
  if (canApproveFootage(role, stage)) {
    buttons.push(
      <Button key="af" loading={busy === "approve-footage"} onClick={() => act("approve-footage")}>
        Approve footage
      </Button>
    );
  }
  if (canRejectFootage(role, stage)) {
    buttons.push(
      <Button key="rf" variant="danger" loading={busy === "reject-footage"} onClick={() => act("reject-footage")}>
        Send back for re-shoot
      </Button>
    );
  }
  if (canSubmitEdit(role, stage)) {
    buttons.push(
      <span key="se" title={editBlocked ? "Every subtask must be checked off before the edit can be submitted." : undefined}>
        <Button disabled={editBlocked} onClick={() => setSubmitKind("edit")}>
          Submit edit
        </Button>
      </span>
    );
  }
  if (canApproveEdit(role, stage) && !editApproved) {
    buttons.push(
      <Button key="ae" loading={busy === "approve-edit"} onClick={() => act("approve-edit")}>
        Approve edit
      </Button>
    );
  }
  if (canRequestChanges(role, stage)) {
    buttons.push(
      <Button key="rc" variant="danger" loading={busy === "request-changes"} onClick={() => act("request-changes")}>
        Request changes
      </Button>
    );
  }

  if (buttons.length === 0 && !error) return null;

  return (
    <div className="card border-clay-500/20 bg-clay-50/50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">Your move</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">{buttons}</div>
      {canSubmitEdit(role, stage) && editBlocked && (
        <p className="mt-2.5 text-[13px] text-ink-400">
          {incompleteSubtasks} subtask{incompleteSubtasks === 1 ? "" : "s"} still open — the edit can’t be
          submitted until the checklist is complete.
        </p>
      )}
      {error && <p className="mt-2.5 text-[13px] text-red-700">{error}</p>}

      <Modal
        open={Boolean(submitKind)}
        onClose={() => setSubmitKind(null)}
        title={submitKind === "footage" ? "Submit footage" : "Submit edit"}
        subtitle="Share a link to the deliverable — it moves the project into review."
      >
        <form onSubmit={submitDeliverable} className="space-y-4">
          <Input
            label="Link"
            type="url"
            required
            placeholder="https://drive.google.com/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <TextArea
            label="Note for the reviewer (optional)"
            placeholder="What should they look at first?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-[13px] text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setSubmitKind(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy === "submit-footage" || busy === "submit-edit"}>
              Submit for review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
