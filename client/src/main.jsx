import { NextUIProvider } from "@nextui-org/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import AppContainer from "./AppContainer";
import { ToastProvider, AccessibilityProvider } from "./components/ui";
import "./index.css";
import store from "./store/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NextUIProvider>
      <Provider store={store}>
        <AccessibilityProvider>
          <ToastProvider>
            <AppContainer />
          </ToastProvider>
        </AccessibilityProvider>
      </Provider>
    </NextUIProvider>
  </StrictMode>
);