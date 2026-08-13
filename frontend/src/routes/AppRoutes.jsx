import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import CashierRoute from "./CashierRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import Product from "../pages/admin/Product";
import Inventory from "../pages/admin/Inventory";
import Finance from "../pages/admin/Finance";
import Report from "../pages/admin/Report";
import Member from "../pages/admin/Member";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" />} />

                {/* Login TIDAK boleh di-nest di dalam AdminLayout, karena belum tentu sudah login */}
                <Route path="/login" element={<Login />} />

                {/* Semua route /admin/* dilindungi + pakai AdminLayout (sidebar dll) */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<Product />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="finance" element={<Finance />} />
                    <Route path="reports" element={<Report />} />
                    <Route path="members" element={<Member />} />
                </Route>
                <Route path="kasir/*" element={<CashierRoute />} /> 
            </Routes>
        </BrowserRouter>
    );
}
