import { PageContainer } from "@/components/app/page";
import { Skeleton } from "@/components/ui/skeleton";
import { copy } from "@/content/copy";

export default function Loading() {
  return (
    <PageContainer aria-busy="true" className="grid gap-12 md:gap-16">
      <span className="sr-only" role="status">{copy.comun.cargando}</span>
      <div className="grid gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-4/5 max-w-xl md:h-20" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="grid gap-5 rounded-lg border border-border p-6">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid content-start gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 border-t border-border py-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-6 rounded-lg border border-border p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </PageContainer>
  );
}
