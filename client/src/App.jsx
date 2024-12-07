import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Layout from "./components/Layout/Layout";
// import ChatPage from "./pages/Chatbot/chattest";
import AgreementOfSaleForm from "./components/DocGen/AOS/AOS";
import DeedOfSaleOfFlat from "./components/DocGen/DOSF/DOSF";
import LandSaleDeedForm from "./components/DocGen/DOSL/DOSL";
import WillDeedForm from "./components/DocGen/DOW/DOW";
import EmployeeNDAForm from "./components/DocGen/ENDNCA/ENDNCA";
import GenAIClause from "./components/DocGen/GenAIClause";
import LicenseAgreementForm from "./components/DocGen/LLA/LLA";
import NDAForm from "./components/DocGen/NDA/NDA";
import POA from "./components/DocGen/POW/POA";
import Chatbot from "./pages/Chatbot/Chatbot";
import Contact from "./pages/Contact/Contact";
import SelectionPage from "./pages/DocGen/SelectionPage";
import LandingSearch from "./pages/Landing/LandingSearch";
import Recommend from "./pages/Recommend/Recommend";
import Resources from "./pages/Resources/Resources";
import Results from "./pages/Result/Results";
import SeprateResults from "./pages/SeprateResults/SeprateResults";
import SiteChatbot from "./sitewidechatbot/Chatbot";

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
                <SiteChatbot />
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
          {/*legal doc gen routes */}
          <Route
            path="/docgen"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SelectionPage />} />
          </Route>
          <Route
            path="/docgen/NDA"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NDAForm />} />
          </Route>
          <Route
            path="/docgen/POA"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<POA />} />
          </Route>
          <Route
            path="/docgen/LLA"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LicenseAgreementForm />} />
          </Route>
          <Route
            path="/docgen/ENDNCA"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeNDAForm />} />
          </Route>
          <Route
            path="/docgen/DOSF"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DeedOfSaleOfFlat />} />
          </Route>
          <Route
            path="/docgen/DOSL"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LandSaleDeedForm />} />
          </Route>
          <Route
            path="/docgen/DOW"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WillDeedForm />} />
          </Route>
          <Route
            path="/docgen/GenAIClause"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GenAIClause />} />
          </Route>
          <Route
            path="/docgen/AOS"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgreementOfSaleForm />} />
          </Route>
        </Routes>
      </Router>
    </RecoilRoot>
  );
};

export default App;
