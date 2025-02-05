// src/components/LoadingSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <div className="dashboard-card space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-40 w-full" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="dashboard-card flex flex-col gap-4">
    <Skeleton className="h-6 w-1/4" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export const TableSkeleton = ({ columns = 5 }) => (
  <div className="dashboard-card space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <div className="space-y-2">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  </div>
);