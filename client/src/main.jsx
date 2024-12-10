import { NextUIProvider } from "@nextui-org/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import AppContainer from "./AppContainer";
import "./index.css";
import store from "./store/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NextUIProvider>
      <Provider store={store}>
        <AppContainer />
      </Provider>
    </NextUIProvider>
  </StrictMode>
);
