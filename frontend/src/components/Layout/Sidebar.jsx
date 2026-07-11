import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200";

function Item({ to, end, icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${linkBase} ${
          isActive
            ? "bg-ink-900/6 text-ink-900"
            : "text-ink-600 hover:bg-ink-900/4 hover:text-ink-900"
        }`
      }
    >
      <span className="text-ink-400">{icon}</span>
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r hairline bg-bone-100/60 px-4 py-6">
      <NavLink to="/" className="flex items-center gap-2.5 px-2">
        <span className="grid size-8 place-items-center rounded-lg bg-ink-900">
          <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden>
            <circle cx="14" cy="16" r="7" fill="none" stroke="#C4633F" strokeWidth="3" />
            <circle cx="24" cy="16" r="3" fill="#FAF9F5" />
          </svg>
        </span>
        <span className="font-display text-lg font-medium tracking-tight text-ink-900">
          Creator&nbsp;OS
        </span>
      </NavLink>

      <nav className="mt-8 flex flex-col gap-1">
        <Item
          to="/"
          end
          icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          }
        >
          Projects
        </Item>
        <Item
          to="/clients"
          icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <circle cx="7.5" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1.8 13.2c.7-2.6 3-4 5.7-4s5 1.4 5.7 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          }
        >
          Clients
        </Item>
        <Item
          to="/team"
          icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <circle cx="5" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="10.6" cy="6.4" r="1.9" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1.4 12.8c.5-2.1 2-3.3 3.9-3.3 1.4 0 2.6.7 3.3 1.9M9 12.9c.3-1.2 1.2-2 2.3-2 1 0 1.9.6 2.3 1.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          }
        >
          Team
        </Item>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-xl border hairline bg-white/70 p-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-clay-100 text-xs font-bold text-clay-700">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink-900">{user?.name}</p>
            <p className="truncate text-[11px] capitalize text-ink-400">{user?.jobTitle}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="grid size-7 shrink-0 place-items-center rounded-md text-ink-400
              transition-colors duration-200 hover:bg-ink-900/5 hover:text-ink-900 cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M8.5 1.5H11a.8.8 0 01.8.8v8.4a.8.8 0 01-.8.8H8.5M5.5 9.5l-3-3 3-3M2.7 6.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
