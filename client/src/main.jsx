import { Auth0Provider } from "@auth0/auth0-react";
import { NextUIProvider } from "@nextui-org/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import store from "./store/store.js";
import { getConfig } from "./config";
import "./index.css";
import history from "./utils/history";
import AppContainer from "./AppContainer.jsx";

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
        <Provider store={store}>
          <AppContainer />
        </Provider>

      </NextUIProvider>
    </Auth0Provider>
  </StrictMode>
);
