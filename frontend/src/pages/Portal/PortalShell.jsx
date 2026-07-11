import { usePortalAuth } from "../../context/PortalAuthContext";

/* Shared chrome for portal pages: slim header with the client's name and sign-out. */
export default function PortalShell({ children }) {
  const { client, logout } = usePortalAuth();

  return (
    <div className="min-h-screen bg-bone-100">
      <header className="border-b hairline bg-bone-50/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden>
              <circle cx="14" cy="16" r="7" fill="none" stroke="#C4633F" strokeWidth="3" />
              <circle cx="24" cy="16" r="3" fill="#2B2A26" />
            </svg>
            <span className="font-display text-[15px] font-medium text-ink-900">Client portal</span>
          </span>
          <span className="flex items-center gap-3 text-[13px] text-ink-400">
            {client?.name}
            <button
              onClick={logout}
              className="font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 cursor-pointer
                transition-colors duration-200 hover:text-ink-900"
            >
              Sign out
            </button>
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}
