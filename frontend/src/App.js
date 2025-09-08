import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import StudentDashboard from "./components/Student/StudentDashboard";
import StudentUpload from "./components/Student/StudentUpload";
import StudentPortfolio from "./components/Student/StudentPortfolio";
import StudentAnalytics from "./components/Student/StudentAnalytics";
import StudentAllEvents from "./components/Student/StudentAllEvents";
import FacultyDashboard from "./components/Faculty/FacultyDashboard";
import FacultyReviews from "./components/Faculty/FacultyReviews";
import FacultyStudents from "./components/Faculty/FacultyStudents";
import FacultyAnalytics from "./components/Faculty/FacultyAnalytics";
import AllEvents from "./components/Faculty/AllEvents";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import "./styles/animations.css";
import "./styles/utilities.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard/:role"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/upload/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentUpload />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/portfolio/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentPortfolio />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/analytics/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentAnalytics />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student/events"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentAllEvents />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Faculty Routes */}
              <Route
                path="/faculty/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/reviews/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyReviews />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/students/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyStudents />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/analytics/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyAnalytics />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/events"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <AllEvents />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
