import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./features/auth/LoginPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { UsersPage } from "./features/users/UsersPage";
import { BrandsPage } from "./features/brands/BrandsPage";
import { ModelsPage } from "./features/models/ModelsPage";
import { VehiclesPage } from "./features/vehicles/VehiclesPage";
import { AuditPage } from "./features/audit/AuditPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
