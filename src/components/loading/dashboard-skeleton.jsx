import { Skeleton } from '../ui/skeleton';

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Latest quiz skeleton */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>

            {/* Quiz history skeleton */}
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-16 rounded-full" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
