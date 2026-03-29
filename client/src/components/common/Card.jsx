export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`surface-card ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-semibold text-stone-800">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

