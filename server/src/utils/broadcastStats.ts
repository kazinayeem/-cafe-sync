import { io } from "..";
import { Table } from "../models/Table";

export const broadcastStats = async () => {
  const total = await Table.countDocuments();
  const available = await Table.countDocuments({ status: "free" });
  io.emit("tableStatsUpdated", { total, available });
};
