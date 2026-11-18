export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="entity-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span className="skeleton skeleton--avatar" />
          <span className="skeleton-lines">
            <span className="skeleton skeleton--title" />
            <span className="skeleton skeleton--line" />
            <span className="skeleton skeleton--line skeleton--short" />
          </span>
        </div>
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="detail-skeleton" aria-hidden="true">
      <span className="skeleton skeleton--avatar-lg" />
      <span className="skeleton-lines">
        <span className="skeleton skeleton--title" />
        <span className="skeleton skeleton--line" />
        <span className="skeleton skeleton--line skeleton--short" />
      </span>
    </div>
  )
}
