import { Link } from "react-router-dom";
import "../../styles/dashboardcard.css";

export default function DashboardCard({
    to,
    icon,
    title,
    iconClass = "",
}) {
    return (
        <Link to={to} className="dashboard-card">
            <div className={`card-icon ${iconClass}`}>
                {icon}
            </div>
            <h3>{title}</h3>
        </Link>
    );
}