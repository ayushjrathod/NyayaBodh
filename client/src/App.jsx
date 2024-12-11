import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AgreementOfSaleForm from "./components/DocGen/AOS/AOS";
import DeedOfSaleOfFlat from "./components/DocGen/DOSF/DOSF";
import LandSaleDeedForm from "./components/DocGen/DOSL/DOSL";
import WillDeedForm from "./components/DocGen/DOW/DOW";
import EmployeeNDAForm from "./components/DocGen/ENDNCA/ENDNCA";
import GenAIClause from "./components/DocGen/GenAIClause";
import LicenseAgreementForm from "./components/DocGen/LLA/LLA";
import NDAForm from "./components/DocGen/NDA/NDA";
import POA from "./components/DocGen/POW/POA";
import Layout from "./components/Layout/Layout";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Login from "./pages/Auth/Login";
import Chatbot from "./pages/Chatbot/Chatbot";
import Contact from "./pages/Contact/Contact";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import SelectionPage from "./pages/DocGen/SelectionPage";
import LandingSearch from "./pages/Landing/LandingSearch";
import LandingSearchSemantic from "./pages/Landing/LandingSearchSemantic";
import LawLookupPage from "./pages/LawLookup/LawLookup";
import PdfSummary from "./pages/PdfSummary/PdfSummary";
import Recommend from "./pages/Recommend/Recommend";
import Results from "./pages/Result/Results";
import SeprateResults from "./pages/SeprateResults/SeprateResults";
import Unauthorized from "./pages/Unauthorized/Unauthorized";

const App = () => {
  const isLoading = false;
  const error = null;
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (localStorage.getItem("access_token")) {
  //     dispatch(fetchUserProfile());
  //   }
  // }, [dispatch]);

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
    <GoogleOAuthProvider clientId="141965980825-262jk7uh4h31v5vqojbe7jhl0eof0mgp.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <LandingSearch />
                {/* <SiteChatbot /> */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/semantic"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LandingSearchSemantic />} />
          </Route>
          <Route
            path="/results"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Results />} />
          </Route>
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Chatbot />} />
          </Route>
          <Route
            path="/recommend/:uuid"
            element={ 
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Recommend />} />
          </Route>
          <Route
            path="/contact"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Contact />} />
          </Route>
          <Route
            path="/lawlookup"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LawLookupPage />} />
          </Route>
          <Route
            path="/result/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SeprateResults />} />
          </Route>
          <Route
            path="/summary/pdf"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "JUDGE", "CLERK", "LAWYER", "USER"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PdfSummary />} />
          </Route>

          <Route
            path="/docgen"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SelectionPage />} />
          </Route>
          <Route
            path="/docgen/NDA"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NDAForm />} />
          </Route>
          <Route
            path="/docgen/POA"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<POA />} />
          </Route>
          <Route
            path="/docgen/LLA"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LicenseAgreementForm />} />
          </Route>
          <Route
            path="/docgen/ENDNCA"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeNDAForm />} />
          </Route>
          <Route
            path="/docgen/DOSF"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DeedOfSaleOfFlat />} />
          </Route>
          <Route
            path="/docgen/DOSL"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LandSaleDeedForm />} />
          </Route>
          <Route
            path="/docgen/DOW"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WillDeedForm />} />
          </Route>
          <Route
            path="/docgen/GenAIClause"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GenAIClause />} />
          </Route>
          <Route
            path="/docgen/AOS"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CLERK"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgreementOfSaleForm />} />
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
