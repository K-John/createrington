import { Home } from "./pages/Home/Home";
import { AuthProvider } from "./contexts/auth";
import { Sidebar } from "./components/Sidebar";
import {
  WebSocketProvider,
  ServerDataProvider,
  PlayerDataProvider,
} from "./contexts/socket";
import "./styles/main.scss";
import styles from "./App.module.scss";

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
          <PlayerDataProvider autoSubscribe>
            <div className={styles.app}>
              <Sidebar />
              <main className={styles.main}>
                <Home />
              </main>
            </div>
          </PlayerDataProvider>
        </ServerDataProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
