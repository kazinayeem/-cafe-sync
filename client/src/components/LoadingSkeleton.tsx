import { Skeleton } from "./ui/skeleton";

export const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-8 font-sans">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
      <Skeleton className="h-10 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="flex items-center gap-3 mt-4 sm:mt-0">
        <Skeleton className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
        <Skeleton className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
        <Skeleton className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>

    {/* Filter Section */}
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
      <Skeleton className="h-6 w-32 mb-4 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col">
          <Skeleton className="h-5 w-24 mb-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex flex-col">
          <Skeleton className="h-5 w-24 mb-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex flex-col">
          <Skeleton className="h-5 w-24 mb-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex flex-col">
          <Skeleton className="h-5 w-24 mb-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex flex-col">
          <Skeleton className="h-5 w-24 mb-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>

    {/* Orders Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-6 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
              <Skeleton className="h-4 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-3 w-40 mt-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="flex flex-col items-end">
              <Skeleton className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-3 w-16 mt-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
                </div>
                <Skeleton className="h-4 w-16 rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
            <Skeleton className="h-3 w-24 mt-2 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Skeleton className="h-6 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-10 w-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex justify-center mt-8">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800"
          />
        ))}
        <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  </div>
);