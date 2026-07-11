import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Badge from "../components/UI/Badge";
import EmptyState from "../components/UI/EmptyState";
import { ListSkeleton } from "../components/UI/Skeleton";

/*
 * Agency roster. Anyone can view; inviting is owner-gated on the backend —
 * the invitee must already have a Creator OS account and accepts via email.
 */
export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState(null);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState(null); // { tone: "ok" | "err", text }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/agencies/members");
      setMembers(data.data);
    } catch {
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await api.post("/agencies/invite-member", { email });
      setNotice({ tone: "ok", text: `Invite sent to ${email}. They accept from their inbox.` });
      setEmail("");
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div>
        <p className="font-display text-sm italic text-clay-600">The crew</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-ink-900">Team</h1>
      </div>

      <form onSubmit={invite} className="card mt-8 p-5">
        <h2 className="text-[15px] font-semibold text-ink-900">Invite a teammate</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
          They need a Creator OS account first (and no agency yet). Owner-only — the invite lands in their email.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            type="email"
            required
            placeholder="teammate@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" loading={busy}>
            Send invite
          </Button>
        </div>
        {notice && (
          <p className={`mt-2 text-[13px] ${notice.tone === "ok" ? "text-sage-700" : "text-red-700"}`}>
            {notice.text}
          </p>
        )}
      </form>

      <div className="mt-6">
        {members === null ? (
          <ListSkeleton rows={3} />
        ) : members.length === 0 ? (
          <EmptyState title="Just you so far" description="Invite your crew to start allocating them to projects." />
        ) : (
          <div className="space-y-3">
            {members.map((m, i) => (
              <div
                key={m._id}
                className="card flex items-center gap-4 p-4 animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-clay-100 text-sm font-bold text-clay-700">
                  {m.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink-900">
                    {m.name}
                    {m._id === user._id && <span className="ml-2 text-[12px] font-normal text-ink-300">you</span>}
                  </p>
                  <p className="truncate text-[13px] text-ink-400">{m.email}</p>
                </div>
                <Badge tone="neutral">{m.jobTitle}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-ink-300">
        Crafts are labels, not permissions — what someone can do is decided per project when they’re
        allocated as a manager, contributor, or reviewer.
      </p>
    </div>
  );
}
