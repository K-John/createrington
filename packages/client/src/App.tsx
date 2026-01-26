import { Home } from "./pages/Home/Home";
import { AuthProvider } from "./contexts/auth";
import "./styles/main.scss";
import styles from "./App.module.scss";

function App() {
  return (
    <AuthProvider>
      <div className={styles.app}>
        <main className={styles.main}>
          <Home />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
