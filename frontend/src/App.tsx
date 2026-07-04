import { useEffect, useState } from "react";

import HomePage from "./pages/HomePage";

function normalizePath(pathname: string) {
  return pathname === "/workspace" ? "/workspace" : "/";
}

function App() {
  const [route, setRoute] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    function handlePopState() {
      setRoute(normalizePath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(path: "/" | "/workspace") {
    if (normalizePath(window.location.pathname) !== path) {
      window.history.pushState({}, "", path);
    }

    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <HomePage
      isWorkspaceRoute={route === "/workspace"}
      onNavigateLanding={() => navigate("/")}
      onNavigateWorkspace={() => navigate("/workspace")}
    />
  );
}

export default App;
