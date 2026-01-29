import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import {
  WebSocketProvider,
  ServerDataProvider,
  PlayerDataProvider,
} from "./contexts/socket";
import "./styles/main.scss";

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider
        config={{
          autoConnect: true,
          maxReconnectAttempts: 5,
          url: "http://localhost:5000",
          reconnectDelay: 1000,
          healthCheckInterval: 30000, // Ping every 30 seconds
        }}
      >
        <ServerDataProvider autoSubscribe>
          <PlayerDataProvider autoSubscribe></PlayerDataProvider>
        </ServerDataProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
