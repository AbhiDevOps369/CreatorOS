export default function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div className={`card flex flex-col items-center px-8 py-14 text-center animate-fade-up ${className}`}>
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-full bg-bone-100 text-ink-300">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
