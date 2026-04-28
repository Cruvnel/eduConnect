import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "../../styles/profilemenu.css";

export default function ProfileMenu({
    isOpen,
    nome,
    email,
    perfil,
    registro,
    onLogout,
}) {
    if (!isOpen) return null;

    return (
        <div className="profile-dropdown">
            <div className="profile-header">
                <FaUserCircle className="profile-icon" />
                <span className="profile-name">{nome}</span>
            </div>

            <hr className="profile-divider" />

            <div className="profile-info">
                <p className="profile-role">Perfil: {perfil}</p>
                <p className="profile-email">Email: {email}</p>
                <p className="profile-registro">Registro: {registro}</p>
            </div>

            <hr className="profile-divider" />

            <button type="button" className="btn-logout" onClick={onLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
            </button>
        </div>
    );
}