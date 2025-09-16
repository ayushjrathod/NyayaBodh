import { useSelector } from "react-redux";
import App from "./App";
import { SkipLink } from "./components/ui";

/**
 * Root wrapper that provides layout and accessibility features for the application.
 *
 * Reads `isDarkMode` from Redux state and renders a <main> element whose theme classes
 * toggle between dark ("yellow-bright dark") and light ("light"). Includes a
 * SkipLink to "#main-content" and a focusable content container (`div#main-content`)
 * that mounts the main <App /> component.
 *
 * @returns {JSX.Element} The app container element with theme classes and accessibility anchors.
 */
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