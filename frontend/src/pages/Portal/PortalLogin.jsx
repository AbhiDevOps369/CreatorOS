import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePortalAuth } from "../../context/PortalAuthContext";
import { errorMessage } from "../../api/api";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";

/*
 * The client's door. Entirely separate from staff auth — client credentials
 * are provisioned by the agency, and the view inside is read-only.
 */
export default function PortalLogin() {
  const { login } = usePortalAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/portal", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not sign you in"));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone-100 px-6 py-12">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-ink-900">
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
              <circle cx="14" cy="16" r="7" fill="none" stroke="#C4633F" strokeWidth="3" />
              <circle cx="24" cy="16" r="3" fill="#FAF9F5" />
            </svg>
          </span>
          <h1 className="mt-4 font-display text-3xl font-medium text-ink-900">Client portal</h1>
          <p className="mt-2 text-sm text-ink-400">
            Follow your projects and pick up deliverables.
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            hint="Your agency set these credentials up for you."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-[13px] text-red-700">{error}</p>}
          <Button type="submit" size="lg" loading={busy} className="w-full">
            View my projects
          </Button>
        </form>

        <p className="mt-8 text-center text-[13px] text-ink-400">
          Part of the studio?{" "}
          <Link to="/login" className="font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 transition-colors duration-200 hover:text-ink-900">
            Staff sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
