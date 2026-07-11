const fieldClasses = `w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm
  text-ink-900 placeholder:text-ink-300 transition-all duration-200 outline-none
  focus:border-clay-500/60 focus:ring-[3px] focus:ring-clay-500/15`;

export default function Input({ label, hint, error, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-ink-700">{label}</span>
      )}
      <input className={fieldClasses} {...props} />
      {hint && !error && <span className="mt-1.5 block text-xs text-ink-400">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

export function TextArea({ label, className = "", rows = 3, ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-ink-700">{label}</span>
      )}
      <textarea rows={rows} className={`${fieldClasses} resize-y`} {...props} />
    </label>
  );
}

export function Select({ label, className = "", children, ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-ink-700">{label}</span>
      )}
      <select className={`${fieldClasses} appearance-none bg-no-repeat pr-9 cursor-pointer`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%238a8577' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
          backgroundPosition: "right 0.9rem center",
        }}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
