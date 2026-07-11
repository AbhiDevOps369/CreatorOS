import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/api";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Input, { Select } from "../UI/Input";
import { ASSIGNABLE_ROLES } from "../../utils/roleUtils";

/*
 * Staffing a fresh project: pick crew from the agency roster, give each a
 * per-project role (and optionally what they're assigned as), then move the
 * project from `created` to `footage_collection` in one action.
 */
export default function AllocateTeamModal({ open, onClose, projectId, existingMemberIds = [], onDone }) {
  const [staff, setStaff] = useState(null);
  const [rows, setRows] = useState([{ userId: "", role: "contributor", assignedAs: "" }]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRows([{ userId: "", role: "contributor", assignedAs: "" }]);
    setError("");
    api
      .get("/agencies/members")
      .then((res) => setStaff(res.data.data.filter((u) => !existingMemberIds.includes(u._id))))
      .catch((err) => setError(errorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setRow = (i, key, value) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));

  const chosen = rows.map((r) => r.userId).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    const teamAssignments = rows
      .filter((r) => r.userId)
      .map((r) => ({ userId: r.userId, role: r.role, assignedAs: r.assignedAs || undefined }));
    if (teamAssignments.length === 0) {
      setError("Pick at least one person for the crew.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post(`/projects/${projectId}/allocate-team`, { teamAssignments });
      onClose();
      await onDone?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Allocate the crew"
      subtitle="This moves the project onto the road — straight into footage collection."
      wide
    >
      <form onSubmit={submit} className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex items-end gap-2">
            <Select
              label={i === 0 ? "Person" : undefined}
              className="flex-[2]"
              required
              value={row.userId}
              onChange={(e) => setRow(i, "userId", e.target.value)}
            >
              <option value="" disabled>
                {staff === null ? "Loading roster…" : "Choose a teammate"}
              </option>
              {(staff || [])
                .filter((u) => u._id === row.userId || !chosen.includes(u._id))
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} — {u.jobTitle}
                  </option>
                ))}
            </Select>
            <Select
              label={i === 0 ? "Role on this project" : undefined}
              className="flex-[1.4]"
              value={row.role}
              onChange={(e) => setRow(i, "role", e.target.value)}
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r[0].toUpperCase() + r.slice(1)}
                </option>
              ))}
            </Select>
            <Input
              label={i === 0 ? "Assigned as (optional)" : undefined}
              className="flex-[1.4]"
              placeholder="e.g. editor"
              value={row.assignedAs}
              onChange={(e) => setRow(i, "assignedAs", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
              disabled={rows.length === 1}
              className="mb-1 grid size-9 shrink-0 place-items-center rounded-lg text-ink-300 cursor-pointer
                transition-colors duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Remove row"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M2.5 3.5h8M5.5 6v3.5M7.5 6v3.5M3.5 3.5l.5 6.7c0 .7.6 1.3 1.3 1.3h2.4c.7 0 1.3-.6 1.3-1.3l.5-6.7M5 3.5V2.3c0-.4.4-.8.8-.8h1.4c.4 0 .8.4.8.8v1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { userId: "", role: "contributor", assignedAs: "" }])}
          className="text-[13px] font-medium text-clay-600 cursor-pointer transition-colors duration-200 hover:text-clay-700"
        >
          + Add another person
        </button>

        <p className="rounded-lg bg-bone-100 px-3 py-2.5 text-[12px] leading-relaxed text-ink-400">
          Roles are per-project: the same person can review here and edit elsewhere. You’ll want at
          least one <strong className="text-ink-600">contributor</strong> (to shoot and edit) and one{" "}
          <strong className="text-ink-600">reviewer</strong> (to work the gates).
        </p>

        {error && <p className="text-[13px] text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Allocate & start
          </Button>
        </div>
      </form>
    </Modal>
  );
}
