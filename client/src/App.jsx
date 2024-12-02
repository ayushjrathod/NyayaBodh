import { useAuth0 } from "@auth0/auth0-react";
import "boxicons";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Layout from "./components/Layout/Layout";
import Chatbot from "./pages/Chatbot";
import Contact from "./pages/Contact";
import LandingSearch from "./pages/LandingSearch";
import Recommend from "./pages/Recommend";
import Resources from "./pages/Resources";
import Results from "./pages/Results";
import Summary from "./pages/Summary";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (!isAuthenticated) {
    loginWithRedirect();
    return <div>Redirecting to Login...</div>;
  }

  return children;
};

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <RecoilRoot>
      <Router>
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Results />} />
          </Route>
          <Route
            path="/chatbot/:id"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommend/:id"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Recommend />} />
          </Route>
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Resources />} />
          </Route>
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Contact />} />
          </Route>
          <Route
            path="/summary/:title"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Summary />} />
          </Route>
        </Routes>
      </Router>
    </RecoilRoot>
  );
};

export default App;
