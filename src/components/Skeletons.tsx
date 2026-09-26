export function SkeletonPage() {
  return (
    <div className="p-6 md:p-8 animate-pulse w-full">
      <div className="h-8 bg-zinc-900 rounded-sm w-1/3 mb-4"></div>
      <div className="h-4 bg-zinc-900 rounded-sm w-1/4 mb-8"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-900 rounded-sm"></div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-zinc-900 rounded-sm"></div>
        <div className="h-64 bg-zinc-900 rounded-sm"></div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-sm p-6 animate-pulse">
      <div className="h-6 bg-white/10 rounded-sm w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-white/5 rounded-sm w-full"></div>
        <div className="h-4 bg-white/5 rounded-sm w-5/6"></div>
        <div className="h-4 bg-white/5 rounded-sm w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-zinc-900 border-b border-white/10 rounded-t-sm mb-2"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-white/5">
          <div className="h-4 bg-white/5 rounded-sm w-1/4"></div>
          <div className="h-4 bg-white/5 rounded-sm w-1/4"></div>
          <div className="h-4 bg-white/5 rounded-sm w-1/4"></div>
          <div className="h-4 bg-white/5 rounded-sm w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
