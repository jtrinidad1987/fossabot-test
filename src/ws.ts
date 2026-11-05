import type http from "http";
import { WebSocketServer } from "ws";

// Public WebSocket server with default limits. ws <8.21.0 is vulnerable to
// DoS via many request headers (CVE-2024-37890) and via tiny fragments.
export function attachWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (socket) => {
    socket.on("message", (data) => socket.send(`echo: ${data}`));
  });
  return wss;
}
