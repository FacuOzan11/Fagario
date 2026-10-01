import { PageContainer } from "@/components/app/page";
import { Skeleton } from "@/components/ui/skeleton";
import { copy } from "@/content/copy";

export default function Loading() {
  return (
    <PageContainer aria-busy="true" className="grid gap-10 md:gap-12">
      <span className="sr-only" role="status">{copy.comun.cargando}</span>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="grid gap-3">
          <Skeleton className="h-14 w-48 md:h-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-11 w-full sm:w-36" />
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-full" />
      {[4, 3].map((n, g) => (
        <div key={g} className="grid gap-2">
          <div className="border-b border-border pb-3">
            <Skeleton className="h-3 w-24" />
          </div>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border py-4 last:border-0">
              <Skeleton className="size-10 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-1/2 max-w-64" />
                <Skeleton className="h-3 w-1/3 max-w-48" />
              </div>
              <Skeleton className="hidden h-5 w-24 sm:block" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      ))}
    </PageContainer>
  );
}
