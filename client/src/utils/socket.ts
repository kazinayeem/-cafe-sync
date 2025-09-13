import { io } from "socket.io-client";

export const socket = io("https://cafe-sync-mhnc.vercel.app", {
  withCredentials: true,
});
