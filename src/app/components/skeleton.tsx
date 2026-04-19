export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-muted" />
      
      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-4 bg-muted rounded mb-2" />
        <div className="h-4 bg-muted rounded w-2/3 mb-3" />
        
        {/* Specs */}
        <div className="space-y-1 mb-3">
          <div className="h-3 bg-muted rounded w-4/5" />
          <div className="h-3 bg-muted rounded w-3/5" />
        </div>
        
        {/* Rating */}
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-muted rounded" />
          ))}
        </div>
        
        {/* Price */}
        <div className="h-6 bg-muted rounded w-1/2 mb-3" />
        
        {/* Button */}
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
