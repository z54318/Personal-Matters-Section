import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "uno.css";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./auth/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Theme appearance="light" accentColor="cyan" grayColor="slate" radius="large">
          <App />
        </Theme>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
