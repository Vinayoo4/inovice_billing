import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { AppLayout } from "./components/layout/AppLayout";
import { BudgetView } from "./components/BudgetView";
import { LoansView } from "./components/LoansView";
import { LessonsView } from "./components/LessonsView";
import { AdminView } from "./components/AdminView";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { Dashboard } from "./components/Dashboard";

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/budget" />;
  }

  return <>{children}</>;
};

import { useState, useEffect } from "react";

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Router>
      {isOffline && (
        <div className="bg-warning-500 text-white text-center py-1 text-sm font-semibold z-50 relative">
          Offline — all changes saved locally
        </div>
      )}
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="budget" element={<BudgetView />} />
              <Route path="loans" element={<LoansView />} />
              <Route path="lessons" element={<LessonsView />} />
              <Route path="simulate" element={<ScenarioSimulator />} />
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminView />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/budget" />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
