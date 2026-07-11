const VARIANTS = {
  primary:
    "bg-clay-500 text-white shadow-sm hover:bg-clay-600 active:bg-clay-700 disabled:hover:bg-clay-500",
  secondary:
    "bg-white text-ink-900 border border-ink-900/12 hover:border-ink-900/25 hover:bg-bone-50",
  ghost: "text-ink-600 hover:text-ink-900 hover:bg-ink-900/5",
  danger:
    "bg-white text-red-800 border border-red-800/20 hover:bg-red-50 hover:border-red-800/40",
};

const SIZES = {
  sm: "px-3 py-1.5 text-[13px] rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-5 py-2.5 text-[15px] rounded-xl gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
