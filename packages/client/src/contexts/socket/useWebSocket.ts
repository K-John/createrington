import { useContext } from "react";
import { WebSocketContext } from "./context";
import { ServerDataContext } from "./ServerDataContext";
import { PlayerDataContext } from "./PlayerDataContext";
import type {
  WebSocketContextType,
  ServerDataContextType,
  PlayerDataContextType,
} from "./types";

/**
 * Hook to access WebSocket context
 *
 * @throws Error if used outside WebSocketProvider
 */
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }

  return context;
};

/**
 * Hook to access server data context
 *
 * @throws Error if used outside ServerDataProvider
 */
export const useServerData = (): ServerDataContextType => {
  const context = useContext(ServerDataContext);

  if (!context) {
    throw new Error("useServerData must be used within ServerDataProvider");
  }

  return context;
};

/**
 * Hook to access player data context
 *
 * @throws Error if used outside PlayerDataProvider
 */
export const usePlayerData = (): PlayerDataContextType => {
  const context = useContext(PlayerDataContext);

  if (!context) {
    throw new Error("usePlayerData must be used within PlayerDataProvider");
  }

  return context;
};
