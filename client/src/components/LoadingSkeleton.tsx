import { Skeleton } from "./ui/skeleton";

export const LoadingSkeleton = () => (
  <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-8">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-40" />
    </div>
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 flex flex-col gap-4 animate-pulse">
        <div className="flex justify-between items-start flex-wrap gap-2 border-b border-gray-200 dark:border-gray-600 pb-4">
          <div className="flex flex-col">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-md" />
            <div className="flex-1 flex flex-col min-w-0">
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-md" />
            <div className="flex-1 flex flex-col min-w-0">
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mt-2">
          <Skeleton className="h-10 w-full sm:w-48" />
          <Skeleton className="h-10 w-full sm:w-24" />
        </div>
      </div>
    ))}
  </div>
);