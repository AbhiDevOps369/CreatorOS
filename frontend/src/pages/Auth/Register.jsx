import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../api/api";
import AuthShell from "./AuthShell";
import Button from "../../components/UI/Button";
import Input, { Select } from "../../components/UI/Input";

const CRAFTS = ["videographer", "editor", "designer", "producer", "other"];

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", jobTitle: "videographer" });
  const [customCraft, setCustomCraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const jobTitle = form.jobTitle === "other" ? customCraft.trim() : form.jobTitle;
    try {
      await register({ ...form, jobTitle });
      // register does not create a session — sign them straight in
      const user = await login(form.email, form.password);
      navigate(user.agencyId ? "/" : "/onboarding", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not create your account"));
      setBusy(false);
    }
  };

  return (
    <AuthShell tagline="Good work deserves a good road.">
      <h2 className="font-display text-3xl font-medium text-ink-900">Join the studio</h2>
      <p className="mt-2 text-sm text-ink-400">
        Create your account — found an agency after, or wait for an invite.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input label="Full name" required placeholder="Ada Lumet" value={form.name} onChange={set("name")} />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@studio.com"
          value={form.email}
          onChange={set("email")}
        />
        <Select label="Your craft" value={form.jobTitle} onChange={set("jobTitle")}>
          {CRAFTS.map((c) => (
            <option key={c} value={c}>
              {c[0].toUpperCase() + c.slice(1)}
            </option>
          ))}
        </Select>
        {form.jobTitle === "other" && (
          <Input
            label="Tell us your craft"
            required
            placeholder="motion artist"
            value={customCraft}
            onChange={(e) => setCustomCraft(e.target.value)}
          />
        )}
        <Input
          label="Password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          hint="At least 6 characters."
          value={form.password}
          onChange={set("password")}
        />
        {error && <p className="text-[13px] text-red-700">{error}</p>}
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-clay-600 transition-colors duration-200 hover:text-clay-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
