import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalApi } from "../../api/api";
import { usePortalAuth } from "../../context/PortalAuthContext";
import PortalShell from "./PortalShell";
import { StageBadge } from "../../components/UI/Badge";
import EmptyState from "../../components/UI/EmptyState";
import { ListSkeleton } from "../../components/UI/Skeleton";
import { STAGES, stageIndex } from "../../utils/roleUtils";

export default function PortalHome() {
  const { client } = usePortalAuth();
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    portalApi
      .get("/portal/projects")
      .then((res) => setProjects(res.data.data))
      .catch(() => setProjects([]));
  }, []);

  return (
    <PortalShell>
      <div className="animate-fade-up">
        <p className="font-display text-sm italic text-clay-600">Hello, {client?.name}</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink-900">Your projects</h1>

        <div className="mt-8">
          {projects === null ? (
            <ListSkeleton rows={2} />
          ) : projects.length === 0 ? (
            <EmptyState
              title="Nothing in production yet"
              description="When your agency starts a project for you, you'll see it here."
            />
          ) : (
            <div className="space-y-3">
              {projects.map((p, i) => {
                const progress = ((stageIndex(p.stage) + 1) / STAGES.length) * 100;
                return (
                  <Link
                    key={p._id}
                    to={`/portal/projects/${p._id}`}
                    className="card group block p-5 animate-fade-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                    style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="min-w-0 truncate font-display text-lg font-medium text-ink-900 transition-colors duration-200 group-hover:text-clay-600">
                        {p.name}
                      </h2>
                      <StageBadge stage={p.stage} />
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bone-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${p.stage === "delivered" ? "bg-sage-500" : "bg-clay-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-3 text-[12px] text-ink-300">
                      Started{" "}
                      {new Date(p.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
