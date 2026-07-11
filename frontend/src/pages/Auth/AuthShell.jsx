/*
 * Shared split-screen shell for the auth pages: editorial brand panel on the
 * left, the form on the right.
 */
export default function AuthShell({ children, tagline = "The production floor for creative studios." }) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-ink-900 p-10 lg:flex">
        <div className="flex items-center gap-2.5 animate-fade-in">
          <span className="grid size-9 place-items-center rounded-xl bg-white/10">
            <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden>
              <circle cx="14" cy="16" r="7" fill="none" stroke="#C4633F" strokeWidth="3" />
              <circle cx="24" cy="16" r="3" fill="#FAF9F5" />
            </svg>
          </span>
          <span className="font-display text-lg font-medium text-bone-50">Creator OS</span>
        </div>

        <div className="animate-fade-up">
          <h1 className="font-display text-[2.9rem] font-light leading-[1.12] text-bone-50">
            {tagline}
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-bone-50/50">
            From first shoot to final delivery — one road, two gates, and every
            handoff exactly where it should be.
          </p>
        </div>

        <p className="text-xs text-bone-50/30">
          created · footage · review · editing · review · delivered
        </p>

        {/* soft terracotta glow */}
        <div
          className="pointer-events-none absolute -right-32 -bottom-40 size-96 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #C4633F 0%, transparent 70%)" }}
          aria-hidden
        />
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">{children}</div>
      </main>
    </div>
  );
}
