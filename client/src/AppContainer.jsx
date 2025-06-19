import { useSelector } from "react-redux";
import App from "./App";

function AppContainer() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <main className={`${isDarkMode ? "yellow-bright" : "light"}  text-foreground bg-background`}>
      <App />
    </main>
  );
}

export default AppContainer;
