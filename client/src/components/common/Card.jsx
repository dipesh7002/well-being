export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`surface-card ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="theme-text text-lg font-semibold">{title}</h2> : null}
            {subtitle ? <p className="theme-text-muted mt-1 text-sm">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

