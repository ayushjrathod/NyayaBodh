import { useSelector } from "react-redux";
import App from "./App";
import { SkipLink } from "./components/ui";

function AppContainer() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <main className={`${isDarkMode ? "yellow-bright dark" : "light"} text-foreground bg-background`}>
      <SkipLink href="#main-content" />
      <div id="main-content" tabIndex={-1}>
        <App />
      </div>
    </main>
  );
}

export default AppContainer;