import OrderSummary from "@/components/RealTimeOrderStatus";
import TableRealTimeUpdate from "@/components/TableStats";
import MainPage from "@/pages/MainPage";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";

export default function DashboardHome() {
  const { role } = useSelector((state: RootState) => state.user);

  return (
    <div className="mx-auto p-2">
      <div className="w-full">
        {role === "admin" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First row: 2 tables + 1 order summary */}
            <TableRealTimeUpdate />

            <OrderSummary />
          </div>
        ) : (
          <MainPage />
        )}
      </div>
    </div>
  );
}
