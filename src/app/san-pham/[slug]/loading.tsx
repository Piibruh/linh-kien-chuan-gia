export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-64 bg-muted rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded-xl" />
        <div>
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-5 bg-muted rounded w-1/2 mb-6" />
          <div className="h-28 bg-muted rounded-xl mb-6" />
          <div className="h-12 bg-muted rounded-xl mb-3" />
          <div className="h-12 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
