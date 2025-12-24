import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { UserProvider } from "./app/contexts/UserContext";
import { Toaster } from "sonner";
import "./app/i18n/config";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <App />
    <Toaster position="top-right" />
  </UserProvider>
);
  