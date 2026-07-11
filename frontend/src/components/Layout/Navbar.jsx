import { Link, useLocation } from "react-router-dom";

/*
 * Slim breadcrumb bar. Deep pages (project/task) render their own headers;
 * this just keeps you oriented and provides a way back.
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = [{ to: "/", label: "Studio" }];
  if (parts[0] === "clients") crumbs.push({ to: "/clients", label: "Clients" });
  if (parts[0] === "team") crumbs.push({ to: "/team", label: "Team" });
  if (parts[0] === "projects" && parts[1]) {
    crumbs.push({ to: `/projects/${parts[1]}`, label: "Project" });
    if (parts[2] === "tasks" && parts[3]) {
      crumbs.push({ to: pathname, label: "Task" });
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b hairline bg-bone-50/80 px-8 backdrop-blur-sm">
      <nav className="flex items-center gap-2 text-[13px] text-ink-400">
        {crumbs.map((c, i) => (
          <span key={c.to} className="flex items-center gap-2">
            {i > 0 && <span className="text-ink-300">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-ink-900">{c.label}</span>
            ) : (
              <Link to={c.to} className="transition-colors duration-200 hover:text-ink-900">
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <span className="font-display text-[13px] italic text-ink-300">
        where good work moves forward
      </span>
    </header>
  );
}
