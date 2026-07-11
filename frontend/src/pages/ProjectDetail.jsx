import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";
import PipelineRoad from "../components/Pipeline/PipelineRoad";
import TaskCard from "../components/Task/TaskCard";
import AllocateTeamModal from "../components/Project/AllocateTeamModal";
import MembersPanel from "../components/Project/MembersPanel";
import NotesPanel from "../components/Project/NotesPanel";
import { StageBadge, RoleBadge } from "../components/UI/Badge";
import Button from "../components/UI/Button";
import Modal from "../components/UI/Modal";
import Input, { TextArea, Select } from "../components/UI/Input";
import EmptyState from "../components/UI/EmptyState";
import Skeleton, { CardSkeleton } from "../components/UI/Skeleton";
import {
  canAllocateTeam,
  canDeliver,
  canDo,
  canCreateTask,
  isManagerial,
} from "../utils/roleUtils";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState(null);
  const [notes, setNotes] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loadError, setLoadError] = useState("");

  const [allocateOpen, setAllocateOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assignedTo: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [projectRes, membersRes, tasksRes, notesRes, staffRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/notes`),
        api.get(`/agencies/members`),
      ]);
      setProject(projectRes.data.data);
      setMembers(membersRes.data.data);
      setTasks(tasksRes.data.data);
      setNotes(notesRes.data.data);
      setUsersById(Object.fromEntries(staffRes.data.data.map((u) => [u._id, u])));
      setLoadError("");
    } catch (err) {
      setLoadError(errorMessage(err, "Could not load this project"));
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError) {
    return (
      <EmptyState
        className="animate-fade-up"
        title="Can’t open this project"
        description={loadError}
        action={<Button variant="secondary" onClick={() => navigate("/")}>Back to projects</Button>}
      />
    );
  }

  if (!project || tasks === null) {
    return (
      <div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-10 w-2/3" />
        <Skeleton className="mt-8 h-36 w-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const myRole = members.find((m) => m.userId === user._id)?.role;
  const { stage, editApproved } = project;

  const deliver = async () => {
    setBusy("deliver");
    setActionError("");
    try {
      await api.post(`/projects/${projectId}/deliver`);
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setBusy("task");
    setActionError("");
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title: taskForm.title,
        description: taskForm.description || undefined,
        assignedTo: taskForm.assignedTo || undefined,
      });
      setTaskOpen(false);
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setBusy("edit");
    setActionError("");
    try {
      await api.patch(`/projects/${projectId}`, editForm);
      setEditOpen(false);
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const deleteProject = async () => {
    setBusy("delete");
    setActionError("");
    try {
      await api.delete(`/projects/${projectId}`);
      navigate("/", { replace: true });
    } catch (err) {
      setActionError(errorMessage(err));
      setBusy(null);
    }
  };

  const showAllocate = canAllocateTeam(myRole, stage);
  const showDeliver = canDo("deliver", myRole, stage);

  return (
    <div className="animate-fade-up">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/" className="text-[13px] text-ink-400 transition-colors duration-200 hover:text-ink-900">
            ← All projects
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">{project.name}</h1>
            <StageBadge stage={stage} />
            <RoleBadge role={myRole} />
          </div>
          {project.description && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-400">{project.description}</p>
          )}
        </div>

        {isManagerial(myRole) && (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditForm({ name: project.name, description: project.description || "" });
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
            {myRole === "owner" && (
              <Button variant="ghost" size="sm" className="hover:!bg-red-50 hover:!text-red-700" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* the road */}
      <div className="mt-8">
        <PipelineRoad stage={stage} editApproved={editApproved} />
      </div>

      {/* project-level actions for the current stage */}
      {(showAllocate || showDeliver) && (
        <div className="card mt-4 border-clay-500/20 bg-clay-50/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">Your move</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {showAllocate && (
              <Button onClick={() => setAllocateOpen(true)}>Allocate the crew</Button>
            )}
            {showDeliver && (
              <span title={!editApproved ? "The reviewer must approve the edit before delivery." : undefined}>
                <Button
                  disabled={!canDeliver(myRole, stage, editApproved)}
                  loading={busy === "deliver"}
                  onClick={deliver}
                >
                  Deliver to client
                </Button>
              </span>
            )}
            {showDeliver && !editApproved && (
              <span className="text-[13px] text-ink-400">Awaiting the reviewer’s approval of the edit.</span>
            )}
          </div>
          {actionError && <p className="mt-2 text-[13px] text-red-700">{actionError}</p>}
        </div>
      )}

      {/* body: tasks + side panels */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_310px]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-ink-900">Tasks</h2>
            {canCreateTask(myRole) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTaskForm({ title: "", description: "", assignedTo: "" });
                  setActionError("");
                  setTaskOpen(true);
                }}
              >
                + New task
              </Button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {tasks.length === 0 ? (
              <EmptyState
                title="No tasks yet"
                description={
                  canCreateTask(myRole)
                    ? "Break the work down — footage, edits, design passes."
                    : "The manager or reviewer hasn’t broken the work down yet."
                }
              />
            ) : (
              tasks.map((t) => (
                <TaskCard
                  key={t._id}
                  projectId={projectId}
                  task={t}
                  assigneeName={usersById[t.assignedTo]?.name}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <MembersPanel
            projectId={projectId}
            members={members}
            usersById={usersById}
            myRole={myRole}
            meId={user._id}
            onChanged={load}
          />
          <NotesPanel
            projectId={projectId}
            notes={notes}
            usersById={usersById}
            myRole={myRole}
            meId={user._id}
            onChanged={load}
          />
        </div>
      </div>

      {/* modals */}
      <AllocateTeamModal
        open={allocateOpen}
        onClose={() => setAllocateOpen(false)}
        projectId={projectId}
        existingMemberIds={members.map((m) => m.userId)}
        onDone={load}
      />

      <Modal open={taskOpen} onClose={() => setTaskOpen(false)} title="New task">
        <form onSubmit={createTask} className="space-y-4">
          <Input
            label="Title"
            required
            placeholder="Shoot the interview b-roll"
            value={taskForm.title}
            onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
          />
          <TextArea
            label="Description (optional)"
            placeholder="Details, references, links…"
            value={taskForm.description}
            onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Assign to (optional)"
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {usersById[m.userId]?.name || m.userId} ({m.role})
              </option>
            ))}
          </Select>
          {actionError && <p className="text-[13px] text-red-700">{actionError}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setTaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy === "task"}>
              Create task
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <form onSubmit={saveEdit} className="space-y-4">
          <Input
            label="Name"
            required
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
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
        title={`Delete “${project.name}”?`}
        subtitle="This removes the project for everyone. There is no undo."
      >
        {actionError && <p className="mb-3 text-[13px] text-red-700">{actionError}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Keep it
          </Button>
          <Button variant="danger" loading={busy === "delete"} onClick={deleteProject}>
            Delete project
          </Button>
        </div>
      </Modal>
    </div>
  );
}
