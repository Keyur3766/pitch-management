import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import PitchList from './pages/PitchList'
import PitchBooking from './pages/PitchBooking'
import { SocketProvider } from './context/SocketContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return children
}

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Router>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/pitches"
                element={
                  <ProtectedRoute>
                    <PitchList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pitches/:id"
                element={
                  <ProtectedRoute>
                    <PitchBooking />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App