import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api, { errorMessage } from "../../api/api";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";

/*
 * Shown when a signed-in user has no agencyId: either they found their own
 * agency here, or they wait for an owner to invite them (the invite is
 * accepted via a link sent to their email).
 */
export default function CreateAgency() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/agencies", { name });
      await refreshUser();
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not create the agency"));
      setBusy(false);
    }
  };

  const recheck = async () => {
    setChecking(true);
    try {
      const fresh = await refreshUser();
      if (fresh.agencyId) navigate("/", { replace: true });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone-50 px-6 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <p className="font-display text-sm italic text-clay-600">Almost there, {user?.name?.split(" ")[0]}</p>
          <h1 className="mt-2 font-display text-4xl font-medium text-ink-900">Set up your studio</h1>
        </div>

        <form onSubmit={create} className="card p-6">
          <h2 className="text-[15px] font-semibold text-ink-900">Found a new agency</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
            You’ll be the owner — you create projects, approve the work, and have final say.
          </p>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="e.g. Northlight Studio"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" loading={busy}>
              Create
            </Button>
          </div>
          {error && <p className="mt-2 text-[13px] text-red-700">{error}</p>}
        </form>

        <div className="card mt-4 p-6">
          <h2 className="text-[15px] font-semibold text-ink-900">Joining an existing agency?</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
            Ask the owner to send an invite to <span className="font-medium text-ink-700">{user?.email}</span>.
            Accept it from your inbox, then check again here.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" loading={checking} onClick={recheck}>
            I’ve accepted my invite
          </Button>
        </div>

        <p className="mt-8 text-center text-[13px] text-ink-400">
          Wrong account?{" "}
          <button onClick={logout} className="font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 cursor-pointer transition-colors duration-200 hover:text-ink-900">
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
