import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../api/api";
import AuthShell from "./AuthShell";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";

export default function Login() {
  const { login } = useAuth();
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
      const user = await login(email, password);
      navigate(user.agencyId ? "/" : "/onboarding", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not sign you in"));
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="font-display text-3xl font-medium text-ink-900">Welcome back</h2>
      <p className="mt-2 text-sm text-ink-400">Sign in to your studio.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-[13px] text-red-700">{error}</p>}
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        New here?{" "}
        <Link to="/register" className="font-medium text-clay-600 transition-colors duration-200 hover:text-clay-700">
          Create an account
        </Link>
      </p>
      <p className="mt-10 border-t hairline pt-5 text-center text-[13px] text-ink-400">
        Looking for your project as a client?{" "}
        <Link to="/portal/login" className="font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 transition-colors duration-200 hover:text-ink-900">
          Client portal
        </Link>
      </p>
    </AuthShell>
  );
}
