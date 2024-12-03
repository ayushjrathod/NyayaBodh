import { Auth0Provider } from "@auth0/auth0-react";
import { NextUIProvider } from "@nextui-org/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { getConfig } from "./config";
import "./index.css";
import history from "./utils/history";

const onRedirectCallback = (appState) => {
  history.push(appState && appState.returnTo ? appState.returnTo : window.location.pathname);
};

const config = getConfig();

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(config.audience ? { audience: config.audience } : null),
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider {...providerConfig}>
      <NextUIProvider>
        <main className="yellow-bright text-foreground bg-background">
          <App />
        </main>
      </NextUIProvider>
    </Auth0Provider>
  </StrictMode>
);
