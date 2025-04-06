import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AssignmentDetailPage from "./pages/AssignmentDetailPage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import QuizzesPage from "./pages/QuizzesPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import QuizDetailPage from "./pages/QuizDetailPage";
import TakeQuizPage from "./pages/TakeQuizPage";
import QuizResultsPage from "./pages/QuizResultsPage";
import ErrorPage from "./pages/ErrorPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes errorElement={<ErrorPage />}>
        <Route path="*" element={<ErrorPage />} />
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/assignments"
          element={authUser ? <AssignmentsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/assignments/create"
          element={
            authUser ? <CreateAssignmentPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/assignments/:id"
          element={
            authUser ? <AssignmentDetailPage /> : <Navigate to="/login" />
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/quizzes"
          element={authUser ? <QuizzesPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/quizzes/create"
          element={authUser ? <CreateQuizPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/quizzes/:id"
          element={authUser ? <QuizDetailPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/quizzes/:id/take"
          element={authUser ? <TakeQuizPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/quizzes/:id/results"
          element={authUser ? <QuizResultsPage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
