import OrderSummary from "@/components/RealTimeOrderStatus";
import Last7DaysSalesPage from "@/components/Show7daysReportGraph";
import TableRealTimeUpdate from "@/components/TableStats";
import MainPage from "@/pages/MainPage";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";

export default function DashboardHome() {
  const { role } = useSelector((state: RootState) => state.user);

  return (
    <div className="mx-auto p-0 w-full overflow-x-hidden">
      {role === "admin" ? (
        <div className="flex flex-col gap-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="w-full min-w-0">
              <TableRealTimeUpdate />
            </div>
            <div className="w-full min-w-0">
              <OrderSummary />
            </div>
          </div>
          <div className="w-full min-w-0">
            <Last7DaysSalesPage />
          </div>
        </div>
      ) : (
        <MainPage />
      )}
    </div>
  );
}
