import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from "./pages/Home/home";
import Login from "./pages/Login/login";
import Workspace from "./pages/Workspace/workspace";
import Targets from "./pages/Targets/targets";
import TeamBoard from "./pages/Teamboard/teamboard";
import Tasks from "./pages/Tasks/tasks";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/workspace"
              element={
                <ProtectedRoute>
                  <Workspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/targets"
              element={
                <ProtectedRoute>
                  <Targets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teamboard"
              element={
                <ProtectedRoute>
                  <TeamBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;