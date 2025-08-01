import "./App.css";
import LoginPage from "./pages/login/loginPage";
import { AuthProvider } from "./context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate,
} from "react-router-dom";
import Home from "./pages/Home/Home";
// import { useAuth } from "./context/useAuth";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import SignUp from "./pages/siginup/siginUp";
import VerifyOtp from "./components/forgotpassord/verifyotp";
import SetPasswordPage from "./pages/setPassword/setPasswordPage";
import SendOtp from "./components/forgotpassord/sendotp";
import AnalyticsPage from "./pages/analyticsPage/analyticsPage";
import ProjectPage from "./pages/projectPage/projectPage";
import ProfilePage from "./pages/profilePage/profilepage";
import SettingPage from "./pages/settigngPage/settingPage";
import FormBuilderPage from "./pages/formBuilderPage/formbuilderPage";
import PageFlow from "./pages/pageFlow/pageFlow";
import PublicAccess from "./pages/publicaccess/publicAccess";
import PrivateAccessByEmail from "./pages/privateAccessByEmail/privateAccessByEmail";
// ProtectedRoute component
// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();
//   if (loading) return <div>Loading...</div>;
//   return user ? children : <Navigate to="/login" replace />;
// }

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route
            path="/"
            element={
              // <ProtectedRoute>
              <Home />

              // </ProtectedRoute>
            }
          />

          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/form-builder/:id/:pageId"
            element={<FormBuilderPage />}
          />
          <Route path="/public/:uniqueUrl" element={<PublicAccess />} />
          <Route
            path="/private/:uniqueUrl"
            element={<PrivateAccessByEmail />}
          />
          <Route path="/page-flow/:id/:pageId" element={<PageFlow />} />

          <Route path="/profile-settings" element={<SettingPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/forgot-password" element={<SendOtp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
