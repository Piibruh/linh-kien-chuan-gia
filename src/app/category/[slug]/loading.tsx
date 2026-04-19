import { ProductGridSkeleton } from '../../../app-old/components/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-muted rounded w-1/3 mb-2 animate-pulse" />
      <div className="h-4 bg-muted rounded w-1/4 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-4 h-96 animate-pulse" />
        </aside>
        <main className="lg:col-span-3">
          <ProductGridSkeleton count={12} />
        </main>
      </div>
    </div>
  );
}
