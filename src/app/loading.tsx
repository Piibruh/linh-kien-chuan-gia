import { ProductGridSkeleton } from '../app-old/components/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-56 md:h-72 bg-muted rounded-2xl animate-pulse mb-10" />
      <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-6" />
      <ProductGridSkeleton count={10} />
    </div>
  );
}
