import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { StageBadge, RoleBadge } from "../components/UI/Badge";
import Button from "../components/UI/Button";
import Modal from "../components/UI/Modal";
import Input, { TextArea, Select } from "../components/UI/Input";
import EmptyState from "../components/UI/EmptyState";
import { CardSkeleton } from "../components/UI/Skeleton";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState(null);
  const [rolesById, setRolesById] = useState({});
  const [clients, setClients] = useState(null); // null → not owner (or not loaded)
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", clientId: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get("/projects");
    const list = data.data;
    setProjects(list);

    // my role lives on the membership of each project
    const roleEntries = await Promise.all(
      list.map(async (p) => {
        try {
          const res = await api.get(`/projects/${p._id}/members`);
          const mine = res.data.data.find((m) => m.userId === user._id);
          return [p._id, mine?.role];
        } catch {
          return [p._id, undefined];
        }
      })
    );
    setRolesById(Object.fromEntries(roleEntries));

    // clients list is owner-gated — a 403 simply means we're not the owner
    try {
      const res = await api.get("/clients");
      setClients(res.data.data);
    } catch {
      setClients(null);
    }
  }, [user._id]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = clients !== null;
  const clientName = (id) => clients?.find((c) => c._id === id)?.name;

  const createProject = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/projects", form);
      setCreateOpen(false);
      navigate(`/projects/${data.data._id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm italic text-clay-600">
            {greeting()}, {user?.name?.split(" ")[0]}
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-ink-900">
            Projects
          </h1>
        </div>
        {isOwner && (
          <Button
            onClick={() => {
              setForm({ name: "", description: "", clientId: clients[0]?._id || "" });
              setError("");
              setCreateOpen(true);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            New project
          </Button>
        )}
      </div>

      <div className="mt-8">
        {projects === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <rect x="2" y="4.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M14 8.8l4-2.4v7.2l-4-2.4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            }
            title="No projects on the board"
            description={
              isOwner
                ? clients?.length
                  ? "Start a project for one of your clients and put it on the road."
                  : "Add a client first — every project belongs to one."
                : "When you're allocated to a project, it will appear here."
            }
            action={
              isOwner &&
              (clients?.length ? (
                <Button onClick={() => setCreateOpen(true)}>New project</Button>
              ) : (
                <Button onClick={() => navigate("/clients")}>Add your first client</Button>
              ))
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p, i) => (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                className="card group block p-5 animate-fade-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <StageBadge stage={p.stage} />
                  <RoleBadge role={rolesById[p._id]} />
                </div>
                <h2 className="mt-3 font-display text-xl font-medium text-ink-900 transition-colors duration-200 group-hover:text-clay-600">
                  {p.name}
                </h2>
                <p className="mt-1 text-[13px] text-ink-400">
                  {clientName(p.clientId) ? `for ${clientName(p.clientId)}` : p.description || "—"}
                </p>
                <p className="mt-5 text-[12px] text-ink-300">
                  Started{" "}
                  {new Date(p.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New project"
        subtitle="It starts at the top of the road — allocate a crew to move it."
      >
        {clients?.length ? (
          <form onSubmit={createProject} className="space-y-4">
            <Input
              label="Project name"
              required
              placeholder="Spring campaign film"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Select
              label="Client"
              required
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <TextArea
              label="Description (optional)"
              placeholder="What are we making?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            {error && <p className="text-[13px] text-red-700">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                Create project
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-ink-600">
            Every project belongs to a client.{" "}
            <Link to="/clients" className="font-medium text-clay-600 hover:text-clay-700">
              Add one first →
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
}
