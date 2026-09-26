import React, { lazy, Suspense } from 'react';

// Lazy load the charts so recharts doesn't block the initial render
const MonthlyBarChart = lazy(() => import('./MonthlyBarChart'));
const MembershipDonut = lazy(() => import('./MembershipDonut'));

export function LazyMonthlyBarChart(props: any) {
  return (
    <Suspense fallback={<div className="w-full h-full min-h-[200px] bg-zinc-900 rounded-sm animate-pulse"></div>}>
      <MonthlyBarChart {...props} />
    </Suspense>
  );
}

export function LazyMembershipDonut(props: any) {
  return (
    <Suspense fallback={
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-40 h-40 rounded-full bg-zinc-900 animate-pulse"></div>
        <div className="space-y-3 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-zinc-900 rounded-sm w-3/4 animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <MembershipDonut {...props} />
    </Suspense>
  );
}
