import { Home } from "lucide-react";
import { Navbar } from "./components/Navbar/Navbar";
import { AuthProvider } from "./contexts/auth";

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main>
          <Home></Home>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
