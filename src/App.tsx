import { Suspense, lazy, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "./components/layout/Navbar";
import PrivateRoute from "./components/auth/PrivateRoute";
import { useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./components/ui/LoadingScreen";

//  Lazy-loaded page components for performance optimization
const Login = lazy(() => import("./pages/Login"));
const Play = lazy(() => import("./pages/Play"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Account = lazy(() => import("./pages/Account"));
const Stats = lazy(() => import("./pages/Stats"));
const Help = lazy(() => import("./pages/Help"));

function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect unauthenticated users to login page
  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected routes
    if (!authLoading && !isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, authLoading, location, navigate]);

  // Simulate a loading screen
  useEffect(() => {
    // Set a maximum loading time of 2 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // If the DOM is already loaded or when it loads, clear the timeout
    if (document.readyState === "complete") {
      setIsLoading(false);
      clearTimeout(timeout);
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        setIsLoading(false);
        clearTimeout(timeout);
      });
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("DOMContentLoaded", () => {});
    };
  }, []);

  // Show loading screen while auth is loading or during initial page load
  if (authLoading || isLoading) {
    return <LoadingScreen />;
  }

  const isPlayPage = location.pathname === "/play";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Global Navbar */}
      <Navbar />
      {/* Main Content Area */}
      <main
        className={`container mx-auto px-4 ${isPlayPage ? "py-0" : "py-6"}`}
      >
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
          }
        >
          {/* Route Definitions */}
          <Routes>
            {/* Public route: Login */}
            <Route
              path="/login"
              element={
                !isAuthenticated ? <Login /> : <Navigate to="/play" replace />
              }
            />
            {/* Protected Routes */}
            <Route
              path="/play"
              element={
                <PrivateRoute>
                  <Play />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings/*"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <PrivateRoute>
                  <Stats />
                </PrivateRoute>
              }
            />
            <Route
              path="/help"
              element={
                <PrivateRoute>
                  <Help />
                </PrivateRoute>
              }
            />
            {/* Catch-all route: redirect to /play or /login depending on authentication status */}
            <Route
              path="*"
              element={
                <Navigate to={isAuthenticated ? "/play" : "/login"} replace />
              }
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
