import { io } from "socket.io-client";
import { getBaseApiUrl } from "../services/apiConfig";

export const socket = io(getBaseApiUrl(), {
  withCredentials: true,
  transports: ["websocket", "polling"],
});
