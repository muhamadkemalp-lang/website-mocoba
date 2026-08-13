import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Bungkus route yang butuh login. allowedRoles opsional, contoh: ["admin"]
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}