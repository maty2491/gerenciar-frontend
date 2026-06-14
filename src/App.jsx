import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Nav from "./pages/Nav";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import ProtectedRoute from "./routes/ProtectedRoute";
import Interviews from "./pages/Interviews";
import Agents from "./pages/Agents";
import TasksPage from "./pages/TasksPage";
import ReturnsPage from "./pages/ReturnsPage"; 
import Repository from "./pages/Repository";
import History from "./pages/CandidatesHistory";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { user, profileStatus } = useAuth();
  const contentClass = user ? "app-content flex-grow-1" : "app-content-full flex-grow-1";
  const showNav = user && profileStatus === "ready";

  return (
    <div className="app-layout d-flex flex-column flex-md-row">
      {showNav && <Nav />}
      <main className={contentClass}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/load-tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/returns-tasks" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
          <Route path="/repository" element={<ProtectedRoute><Repository /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
