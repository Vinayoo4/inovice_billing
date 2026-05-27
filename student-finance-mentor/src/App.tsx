import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { Login } from "./components/auth/Login";
import { AppLayout } from "./components/layout/AppLayout";
import { BudgetView } from "./components/BudgetView";
import { LoansView } from "./components/LoansView";
import { LessonsView } from "./components/LessonsView";
import { AdminView } from "./components/AdminView";

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

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/budget" />} />
              <Route path="budget" element={<BudgetView />} />
              <Route path="loans" element={<LoansView />} />
              <Route path="lessons" element={<LessonsView />} />
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
