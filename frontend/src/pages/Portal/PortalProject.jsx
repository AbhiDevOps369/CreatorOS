import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { portalApi, errorMessage } from "../../api/api";
import PortalShell from "./PortalShell";
import PipelineRoad from "../../components/Pipeline/PipelineRoad";
import { StageBadge } from "../../components/UI/Badge";
import EmptyState from "../../components/UI/EmptyState";
import Skeleton from "../../components/UI/Skeleton";

/*
 * The client's read-only view of one project: where it is on the road, and
 * the deliverables submitted so far. No tasks, notes, or team internals —
 * the backend only sends name, stage and deliverables.
 */
export default function PortalProject() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    portalApi
      .get(`/portal/projects/${projectId}`)
      .then((res) => setProject(res.data.data))
      .catch((err) => setError(errorMessage(err, "Could not load this project")));
  }, [projectId]);

  if (error) {
    return (
      <PortalShell>
        <EmptyState title="Can’t open this project" description={error} />
      </PortalShell>
    );
  }

  if (!project) {
    return (
      <PortalShell>
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="mt-8 h-28 w-full" />
        <Skeleton className="mt-6 h-40 w-full" />
      </PortalShell>
    );
  }

  const delivered = project.stage === "delivered";

  return (
    <PortalShell>
      <div className="animate-fade-up">
        <Link to="/portal" className="text-[13px] text-ink-400 transition-colors duration-200 hover:text-ink-900">
          ← All projects
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink-900">{project.name}</h1>
          <StageBadge stage={project.stage} />
        </div>

        <div className="card mt-8 px-6 py-6">
          <PipelineRoad stage={project.stage} framed={false} showHint={false} />
          <p className="mt-5 border-t hairline pt-4 text-[13px] leading-relaxed text-ink-400">
            {delivered
              ? "Delivered — everything is ready for you below."
              : "Your project is in production. Deliverables appear here as soon as they’re submitted."}
          </p>
        </div>

        <section className="mt-6">
          <h2 className="font-display text-xl font-medium text-ink-900">Deliverables</h2>
          {(project.deliverables || []).length === 0 ? (
            <EmptyState
              className="mt-4"
              title="Nothing to pick up yet"
              description="As footage and edits are submitted, the links will collect here."
            />
          ) : (
            <ul className="mt-4 space-y-2.5">
              {project.deliverables.map((d, i) => (
                <li key={d._id || i}>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="card group flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-clay-100 text-clay-600 transition-colors duration-200 group-hover:bg-clay-500 group-hover:text-white">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                        <path d="M6.5 8.5L13 2M13 6V2H9M7 3H3.5A1.5 1.5 0 002 4.5v7A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink-900">
                        {d.url.replace(/^https?:\/\//, "")}
                      </span>
                      {d.message && (
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-400">{d.message}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
