import TableRealTimeUpdate from "@/components/TableStats";

export default function DashboardHome() {
  return (
    <div className=" mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          🍽️ Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back! Monitor your tables and stats in real-time.
        </p>
      </div>

      {/* Stats / Table Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TableRealTimeUpdate />
        {/* You can add more dashboard cards here in future, e.g., Orders, Revenue */}
      </div>

      {/* Optional: Footer / Notes */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        All stats are updated in real-time.
      </div>
    </div>
  );
}
