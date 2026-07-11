import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../api/api";
import Button from "../components/UI/Button";
import Modal from "../components/UI/Modal";
import Input from "../components/UI/Input";
import EmptyState from "../components/UI/EmptyState";
import { ListSkeleton } from "../components/UI/Skeleton";

/*
 * Client management is owner-gated on the backend (requireAgencyOwner).
 * Non-owners see a friendly explanation instead of a broken page.
 */
export default function Clients() {
  const [clients, setClients] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/clients");
      setClients(data.data);
      setForbidden(false);
    } catch (err) {
      if (err.response?.status === 403) setForbidden(true);
      setClients([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createClient = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/clients", form);
      setCreateOpen(false);
      setForm({ name: "", email: "", password: "" });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeClient = async () => {
    setBusy(true);
    try {
      await api.delete(`/clients/${confirmDelete._id}`);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (forbidden) {
    return (
      <EmptyState
        className="animate-fade-up"
        title="Owner territory"
        description="Only the agency owner manages the client roster. Ask them if someone needs adding."
      />
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm italic text-clay-600">The people you make things for</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-ink-900">Clients</h1>
        </div>
        <Button
          onClick={() => {
            setError("");
            setCreateOpen(true);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Add client
        </Button>
      </div>

      <div className="mt-8">
        {clients === null ? (
          <ListSkeleton rows={3} />
        ) : clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Add a client to start their first project. They get portal access with the email and password you set here."
            action={<Button onClick={() => setCreateOpen(true)}>Add your first client</Button>}
          />
        ) : (
          <div className="space-y-3">
            {clients.map((c, i) => (
              <div
                key={c._id}
                className="card flex items-center gap-4 p-4 animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-100 text-sm font-bold text-sage-700">
                  {c.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink-900">{c.name}</p>
                  <p className="truncate text-[13px] text-ink-400">{c.email}</p>
                </div>
                <button
                  onClick={() => setConfirmDelete(c)}
                  className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-400 cursor-pointer
                    transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add a client"
        subtitle="These credentials are their sign-in for the read-only client portal."
      >
        <form onSubmit={createClient} className="space-y-4">
          <Input
            label="Name"
            required
            placeholder="Meridian Coffee Co."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            placeholder="hello@meridian.coffee"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Portal password"
            type="text"
            required
            minLength={6}
            hint="Share this with the client — they use it to check status and pick up deliverables."
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          {error && <p className="text-[13px] text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Add client
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={`Remove ${confirmDelete?.name}?`}
        subtitle="They lose portal access. Their projects are not deleted."
      >
        {error && <p className="mb-3 text-[13px] text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Keep them
          </Button>
          <Button variant="danger" loading={busy} onClick={removeClient}>
            Remove client
          </Button>
        </div>
      </Modal>
    </div>
  );
}
