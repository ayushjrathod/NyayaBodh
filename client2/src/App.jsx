import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";
import Layout from "./components/Layout/Layout";
import { EnhancedLoader } from "./components/ui";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Login from "./pages/Auth/Login";
import LandingSearch from "./pages/Landing/LandingSearch";
import LandingSearchSemantic from "./pages/Landing/LandingSearchSemantic";
import Results from "./pages/Result/Results";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import { checkAuthState } from "./store/slices/authSlice";

// Lazy load heavy components that are not immediately needed
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const Chatbot = lazy(() => import("./pages/Chatbot/Chatbot"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const LawLookupPage = lazy(() => import("./pages/LawLookup/LawLookup"));
const Recommend = lazy(() => import("./pages/Recommend/Recommend"));
const SeprateResults = lazy(() => import("./pages/SeprateResults/SeprateResults"));
const PdfSummary = lazy(() => import("./pages/PdfSummary/PdfSummary"));
const Profile = lazy(() => import("./pages/Profile/Profile"));

// DocGen components - these are admin-only and can be lazy loaded
const SelectionPage = lazy(() => import("./pages/DocGen/SelectionPage"));
const AgreementOfSaleForm = lazy(() => import("./components/DocGen/AOS/AOS"));
const DeedOfSaleOfFlat = lazy(() => import("./components/DocGen/DOSF/DOSF"));
const LandSaleDeedForm = lazy(() => import("./components/DocGen/DOSL/DOSL"));
const WillDeedForm = lazy(() => import("./components/DocGen/DOW/DOW"));
const EmployeeNDAForm = lazy(() => import("./components/DocGen/ENDNCA/ENDNCA"));
const GenAIClause = lazy(() => import("./components/DocGen/GenAIClause"));
const LicenseAgreementForm = lazy(() => import("./components/DocGen/LLA/LLA"));
const NDAForm = lazy(() => import("./components/DocGen/NDA/NDA"));
const POA = lazy(() => import("./components/DocGen/POW/POA"));

// Enhanced loading component for lazy routes
const LazyLoadingFallback = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <EnhancedLoader size="lg" label={message} center={true} />
  </div>
);

const App = () => {
  const isLoading = false;
  const error = null;
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state on app startup
    dispatch(checkAuthState());
  }, [dispatch]);

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
      </div>
    );
  }

  if (isLoading) {
    return <EnhancedLoader fullScreen={true} size="lg" label="Initializing application..." />;
  }

  return (
    <GoogleOAuthProvider clientId="319048462859-357vnfkhosp0dqr66mjpb2lid83duifs.apps.googleusercontent.com">
      <Router>
        <Routes>
          {/* Public routes - redirect authenticated users */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Public route - accessible to all */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin only routes with lazy loading */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<LazyLoadingFallback message="Loading admin dashboard..." />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Main application routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/semantic"
            element={
              <ProtectedRoute>
                <LandingSearchSemantic />
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

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading profile..." />}>
                  <Profile />
                </Suspense>
              }
            />
          </Route>

          {/* Lazy loaded routes with Layout */}
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading chat interface..." />}>
                  <Chatbot />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/recommend/:uuid"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading recommendations..." />}>
                  <Recommend />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading contact page..." />}>
                  <Contact />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/lawlookup"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading law lookup..." />}>
                  <LawLookupPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/result/:uuid"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading case details..." />}>
                  <SeprateResults />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/summary/pdf"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading PDF summary..." />}>
                  <PdfSummary />
                </Suspense>
              }
            />
          </Route>

          {/* DocGen routes - Admin only with lazy loading */}
          <Route
            path="/docgen"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading document generator..." />}>
                  <SelectionPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/NDA"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading NDA form..." />}>
                  <NDAForm />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/POA"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading POA form..." />}>
                  <POA />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/LLA"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading license agreement form..." />}>
                  <LicenseAgreementForm />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/ENDNCA"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading employee NDA form..." />}>
                  <EmployeeNDAForm />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/DOSF"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading deed of sale form..." />}>
                  <DeedOfSaleOfFlat />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/DOSL"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading land sale deed form..." />}>
                  <LandSaleDeedForm />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/DOW"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading will deed form..." />}>
                  <WillDeedForm />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/GenAIClause"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading AI clause generator..." />}>
                  <GenAIClause />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/docgen/AOS"
            element={
              <ProtectedRoute adminOnly>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LazyLoadingFallback message="Loading agreement of sale form..." />}>
                  <AgreementOfSaleForm />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;