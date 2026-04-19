/** Hiển thị khi chunk route đang tải (code splitting) */
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-hidden
      />
      <span className="text-sm">Đang tải trang…</span>
    </div>
  );
}
