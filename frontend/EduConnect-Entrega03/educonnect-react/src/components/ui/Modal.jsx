import "../../styles/modal.css";

export default function Modal({
    title,
    description,
    onClose,
    children,
    size = "sm",
    className = "",
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-container modal-container--${size} ${className}`.trim()}
                role="dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="modal-close"
                    type="button"
                    aria-label="Fechar modal"
                    onClick={onClose}
                >
                    ×
                </button>

                {title && <h2 className="modal-title">{title}</h2>}
                {description && <p className="modal-description">{description}</p>}

                {children}
            </div>
        </div>
    );
}