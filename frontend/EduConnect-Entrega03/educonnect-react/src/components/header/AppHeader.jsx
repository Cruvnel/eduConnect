import { Link } from "react-router-dom";
import NotificationMenu from "../notificacoes/NotificationMenu";

import "../../styles/header.css";
import "../../styles/notification.css";

export default function AppHeader({
    logo,
    title = "EduConnect",
    homePath = "/",
    rightContent = null,
    showBackButton = false,
    backLabel = "← Voltar",
    onBack = null,
    showNotifications = false,
}) {
    return (
        <header className="app-header">
            <div className="app-header__left">
                <Link to={homePath} className="app-header__brand">
                    <img
                        src={logo}
                        alt="Logo EduConnect"
                        className="app-header__logo"
                    />
                    <span className="app-header__title">{title}</span>
                </Link>
            </div>

            <div className="app-header__right">
                {showBackButton && onBack && (
                    <button
                        type="button"
                        className="app-header__back"
                        onClick={onBack}
                    >
                        {backLabel}
                    </button>
                )}

                {rightContent}

                {showNotifications && <NotificationMenu />}
            </div>
        </header>
    );
}