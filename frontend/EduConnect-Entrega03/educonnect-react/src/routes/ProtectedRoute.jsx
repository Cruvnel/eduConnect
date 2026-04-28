import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const perfil = localStorage.getItem("perfil");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(perfil)) {
        return <Navigate to="/" replace />;
    }

    return children;
}