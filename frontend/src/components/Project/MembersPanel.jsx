import { useState } from "react";
import api, { errorMessage } from "../../api/api";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Input, { Select } from "../UI/Input";
import { RoleBadge } from "../UI/Badge";
import { ASSIGNABLE_ROLES, isManagerial } from "../../utils/roleUtils";

export default function MembersPanel({ projectId, members, usersById, myRole, meId, onChanged }) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", role: "contributor", assignedAs: "" });
  const [editing, setEditing] = useState(null); // membership being edited
  const [editForm, setEditForm] = useState({ role: "", assignedAs: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const manager = isManagerial(myRole);
  const memberIds = members.map((m) => m.userId);
  const addable = Object.values(usersById).filter((u) => !memberIds.includes(u._id));

  const addMember = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/projects/${projectId}/members`, {
        userId: form.userId,
        role: form.role,
        assignedAs: form.assignedAs || undefined,
      });
      setAddOpen(false);
      await onChanged?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.patch(`/projects/${projectId}/members/${editing.userId}`, {
        role: editForm.role,
        assignedAs: editForm.assignedAs || undefined,
      });
      setEditing(null);
      await onChanged?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (membership) => {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/projects/${projectId}/members/${membership.userId}`);
      await onChanged?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink-900">Crew</h2>
        {manager && (
          <button
            onClick={() => {
              setForm({ userId: addable[0]?._id || "", role: "contributor", assignedAs: "" });
              setError("");
              setAddOpen(true);
            }}
            className="text-[13px] font-medium text-clay-600 cursor-pointer transition-colors duration-200 hover:text-clay-700"
          >
            + Add
          </button>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {members.map((m) => {
          const person = usersById[m.userId];
          return (
            <li key={m._id} className="group relative flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-clay-100 text-[11px] font-bold text-clay-700">
                {(person?.name || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink-900">
                  {person?.name || "Unknown"}
                  {m.userId === meId && <span className="ml-1.5 text-[11px] font-normal text-ink-300">you</span>}
                </p>
                <p className="truncate text-[11px] text-ink-400">
                  {m.assignedAs || person?.jobTitle || ""}
                </p>
              </div>
              <RoleBadge role={m.role} />
              {manager && m.role !== "owner" && (
                // overlays the role badge on hover so it never reserves row space
                <span className="pointer-events-none absolute right-0 flex gap-1 rounded-md bg-white pl-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditing(m);
                      setEditForm({ role: m.role, assignedAs: m.assignedAs || "" });
                      setError("");
                    }}
                    className="grid size-6 place-items-center rounded text-ink-300 cursor-pointer
                      transition-colors duration-200 hover:bg-ink-900/5 hover:text-ink-900"
                    aria-label={`Edit ${person?.name}`}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                      <path d="M7.8 1.6l1.6 1.6-6 6-2.1.5.5-2.1 6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => remove(m)}
                    className="grid size-6 place-items-center rounded text-ink-300 cursor-pointer
                      transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
                    aria-label={`Remove ${person?.name}`}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-3 text-[12px] text-red-700">{error}</p>}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add to the crew">
        {addable.length === 0 ? (
          <p className="text-sm text-ink-600">Everyone in the agency is already on this project.</p>
        ) : (
          <form onSubmit={addMember} className="space-y-4">
            <Select
              label="Person"
              required
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
            >
              {addable.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.jobTitle}
                </option>
              ))}
            </Select>
            <Select
              label="Role on this project"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r[0].toUpperCase() + r.slice(1)}
                </option>
              ))}
            </Select>
            <Input
              label="Assigned as (optional)"
              placeholder="e.g. editor"
              value={form.assignedAs}
              onChange={(e) => setForm((f) => ({ ...f, assignedAs: e.target.value }))}
            />
            {error && <p className="text-[13px] text-red-700">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                Add member
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit ${usersById[editing?.userId]?.name || "member"}`}
        subtitle="Role changes apply to this project only."
      >
        <form onSubmit={saveEdit} className="space-y-4">
          <Select
            label="Role on this project"
            value={editForm.role}
            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r[0].toUpperCase() + r.slice(1)}
              </option>
            ))}
          </Select>
          <Input
            label="Assigned as (optional)"
            placeholder="e.g. editor"
            value={editForm.assignedAs}
            onChange={(e) => setEditForm((f) => ({ ...f, assignedAs: e.target.value }))}
          />
          {error && <p className="text-[13px] text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
