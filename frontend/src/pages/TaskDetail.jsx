import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";
import TaskActions from "../components/Task/TaskActions";
import { StageBadge, RoleBadge } from "../components/UI/Badge";
import Button from "../components/UI/Button";
import Modal from "../components/UI/Modal";
import Input, { TextArea } from "../components/UI/Input";
import EmptyState from "../components/UI/EmptyState";
import Skeleton from "../components/UI/Skeleton";
import { canManageSubtasks, isManagerial } from "../utils/roleUtils";

export default function TaskDetail() {
  const { projectId, taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState(null);
  const [members, setMembers] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loadError, setLoadError] = useState("");

  const [newSubtask, setNewSubtask] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [projectRes, taskRes, subtasksRes, membersRes, staffRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks/${taskId}`),
        api.get(`/projects/${projectId}/tasks/${taskId}/subtasks`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/agencies/members`),
      ]);
      setProject(projectRes.data.data);
      setTask(taskRes.data.data);
      setSubtasks(subtasksRes.data.data);
      setMembers(membersRes.data.data);
      setUsersById(Object.fromEntries(staffRes.data.data.map((u) => [u._id, u])));
      setLoadError("");
    } catch (err) {
      setLoadError(errorMessage(err, "Could not load this task"));
    }
  }, [projectId, taskId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError) {
    return (
      <EmptyState
        className="animate-fade-up"
        title="Can’t open this task"
        description={loadError}
        action={
          <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}`)}>
            Back to project
          </Button>
        }
      />
    );
  }

  if (!project || !task || subtasks === null) {
    return (
      <div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-10 w-1/2" />
        <Skeleton className="mt-8 h-24 w-full" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  const myRole = members.find((m) => m.userId === user._id)?.role;
  const { stage, editApproved } = project;
  const doneCount = subtasks.filter((s) => s.isCompleted).length;
  const incompleteCount = subtasks.length - doneCount;
  const assignee = usersById[task.assignedTo];

  const addSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setBusy("subtask");
    setActionError("");
    try {
      await api.post(`/projects/${projectId}/tasks/${taskId}/subtasks`, { title: newSubtask.trim() });
      setNewSubtask("");
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const toggleSubtask = async (s) => {
    setActionError("");
    // optimistic flip — reverted by reload on failure
    setSubtasks((list) => list.map((x) => (x._id === s._id ? { ...x, isCompleted: !x.isCompleted } : x)));
    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}/subtasks/${s._id}`, {
        isCompleted: !s.isCompleted,
      });
    } catch (err) {
      setActionError(errorMessage(err));
      await load();
    }
  };

  const removeSubtask = async (s) => {
    setActionError("");
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}/subtasks/${s._id}`);
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setBusy("edit");
    setActionError("");
    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}`, editForm);
      setEditOpen(false);
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const deleteTask = async () => {
    setBusy("delete");
    setActionError("");
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      navigate(`/projects/${projectId}`, { replace: true });
    } catch (err) {
      setActionError(errorMessage(err));
      setBusy(null);
    }
  };

  const canEditTask = ["owner", "manager", "contributor"].includes(myRole);

  return (
    <div className="animate-fade-up">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/projects/${projectId}`}
            className="text-[13px] text-ink-400 transition-colors duration-200 hover:text-ink-900"
          >
            ← {project.name}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink-900">{task.title}</h1>
            <StageBadge stage={stage} />
            <RoleBadge role={myRole} />
          </div>
          {task.description && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-400">{task.description}</p>
          )}
          <p className="mt-3 text-[13px] text-ink-400">
            {assignee ? (
              <>
                Assigned to <span className="font-medium text-ink-700">{assignee.name}</span>
                {assignee.jobTitle && <span className="text-ink-300"> · {assignee.jobTitle}</span>}
              </>
            ) : (
              <span className="italic">Unassigned</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {canEditTask && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditForm({ title: task.title, description: task.description || "" });
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {isManagerial(myRole) && (
            <Button
              variant="ghost"
              size="sm"
              className="hover:!bg-red-50 hover:!text-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* pipeline actions for this task */}
      <div className="mt-6">
        <TaskActions
          projectId={projectId}
          task={task}
          role={myRole}
          stage={stage}
          editApproved={editApproved}
          incompleteSubtasks={incompleteCount}
          onChanged={load}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* deliverables */}
        <section className="card p-5">
          <h2 className="text-[15px] font-semibold text-ink-900">Deliverables</h2>
          {(task.attachments || []).length === 0 ? (
            <p className="mt-3 text-[13px] italic text-ink-300">
              Nothing submitted yet — deliverables land here when work is submitted for review.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {task.attachments.map((a, i) => (
                <li key={a._id || i}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-lg border hairline bg-bone-50 px-3.5 py-3 transition-all
                      duration-200 hover:border-clay-500/40 hover:bg-clay-50"
                  >
                    <span className="flex items-center gap-2 text-[13px] font-medium text-clay-700">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M5 7l4.5-4.5M9.5 5.5v-3h-3M5.5 2.5H3a1 1 0 00-1 1V9a1 1 0 001 1h5.5a1 1 0 001-1V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="truncate">{a.url.replace(/^https?:\/\//, "")}</span>
                    </span>
                    {a.message && (
                      <span className="mt-1 block pl-5 text-[12px] leading-relaxed text-ink-400">{a.message}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* subtasks */}
        <section className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink-900">Checklist</h2>
            {subtasks.length > 0 && (
              <span className="text-[12px] text-ink-400">
                {doneCount}/{subtasks.length} done
              </span>
            )}
          </div>

          {subtasks.length > 0 && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bone-200">
              <div
                className="h-full rounded-full bg-sage-500 transition-all duration-500"
                style={{ width: `${(doneCount / subtasks.length) * 100}%` }}
              />
            </div>
          )}

          <ul className="mt-3 space-y-1">
            {subtasks.length === 0 && (
              <li className="text-[13px] italic text-ink-300">
                No checklist items. The edit can be submitted freely — add items to define what “done” means.
              </li>
            )}
            {subtasks.map((s) => (
              <li key={s._id} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-bone-100">
                <button
                  onClick={() => toggleSubtask(s)}
                  className={`grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-md border transition-all duration-200
                    ${s.isCompleted ? "border-sage-500 bg-sage-500 text-white" : "border-ink-300 bg-white text-transparent hover:border-clay-500"}`}
                  aria-label={s.isCompleted ? "Mark incomplete" : "Mark complete"}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M1.5 5.5l2.5 2.5 4.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className={`flex-1 text-[13px] transition-all duration-200 ${s.isCompleted ? "text-ink-300 line-through" : "text-ink-700"}`}>
                  {s.title}
                </span>
                {canManageSubtasks(myRole) && (
                  <button
                    onClick={() => removeSubtask(s)}
                    className="text-ink-300 opacity-0 cursor-pointer transition-all duration-200 hover:text-red-700 group-hover:opacity-100"
                    aria-label="Delete subtask"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {canManageSubtasks(myRole) && (
            <form onSubmit={addSubtask} className="mt-3 flex gap-2 border-t hairline pt-3">
              <Input
                placeholder="Add a checklist item…"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary" loading={busy === "subtask"} disabled={!newSubtask.trim()}>
                Add
              </Button>
            </form>
          )}
          {actionError && <p className="mt-2 text-[12px] text-red-700">{actionError}</p>}
        </section>
      </div>

      {/* modals */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit task">
        <form onSubmit={saveEdit} className="space-y-4">
          <Input
            label="Title"
            required
            value={editForm.title}
            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
          />
          <TextArea
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
          />
          {actionError && <p className="text-[13px] text-red-700">{actionError}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy === "edit"}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete “${task.title}”?`}
        subtitle="Its checklist and deliverable links go with it."
      >
        {actionError && <p className="mb-3 text-[13px] text-red-700">{actionError}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Keep it
          </Button>
          <Button variant="danger" loading={busy === "delete"} onClick={deleteTask}>
            Delete task
          </Button>
        </div>
      </Modal>
    </div>
  );
}
