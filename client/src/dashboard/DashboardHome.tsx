import TableRealTimeUpdate from "@/components/TableStats";
import MainPage from "@/pages/MainPage";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";

export default function DashboardHome() {
  const { role } = useSelector((state: RootState) => state.user);
  return (
    <div className=" mx-auto">
      <div className="w-full">
        {role === "admin" ? <TableRealTimeUpdate /> : <MainPage />}
      </div>
    </div>
  );
}
