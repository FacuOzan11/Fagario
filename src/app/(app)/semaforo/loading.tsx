import { PageContainer } from "@/components/app/page";
import { Skeleton } from "@/components/ui/skeleton";
import { copy } from "@/content/copy";

export default function Loading() {
  return (
    <PageContainer aria-busy="true" className="grid gap-14 md:gap-20">
      <span className="sr-only" role="status">{copy.comun.cargando}</span>
      <div className="grid gap-10 md:gap-14">
        <div className="grid gap-5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-14 w-4/5 max-w-2xl md:h-20" />
          <Skeleton className="h-6 w-full max-w-lg" />
        </div>
        <div className="grid gap-8 rounded-xl border border-border p-6 sm:p-10">
          <div className="grid gap-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-14 w-72 max-w-full md:h-20" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-8 w-64 max-w-full" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-44 rounded-lg" />
        <Skeleton className="h-44 rounded-lg" />
      </div>
      <div className="grid gap-8">
        <Skeleton className="h-8 w-56" />
        <div className="grid h-56 grid-cols-12 items-end gap-1 sm:h-64 sm:gap-2">
          {[40, 55, 35, 60, 70, 45, 65, 50, 75, 60, 80, 30].map((h, i) => (
            <Skeleton key={i} className="mx-auto w-full max-w-3 rounded-b-none sm:max-w-4" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
