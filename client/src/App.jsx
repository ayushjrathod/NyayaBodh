import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import "boxicons";
import { LoaderCircle } from "lucide-react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Layout from "./components/Layout/Layout";
// import ChatPage from "./pages/Chatbot/chattest";
import Chatbot from "./pages/Chatbot/Chatbot";
import Contact from "./pages/Contact/Contact";
import LandingSearch from "./pages/Landing/LandingSearch";
import Recommend from "./pages/Recommend/Recommend";
import Resources from "./pages/Resources/Resources";
import Results from "./pages/Result/Results";
import SeprateResults from "./pages/SeprateResults/SeprateResults";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (!isAuthenticated) {
    loginWithRedirect();
    return (
      <div className="h-screen w-screen  flex justify-center items-center">
        <Spinner size="sm" color="primary" />
        Redirecting to Login...
      </div>
    );
  }

  return children;
};

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Card className="bg-red-700">
          <CardHeader>
            <p>Oops... </p>
          </CardHeader>
          <CardBody>
            <p>{error.message}</p>
          </CardBody>
        </Card>
        ;
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Spinner size="sm" color="primary" />
        Loading...
      </div>
    );
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
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Chatbot />} />
          </Route>
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
            path="/result/:id"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SeprateResults />} />
          </Route>
        </Routes>
      </Router>
    </RecoilRoot>
  );
};

export default App;
