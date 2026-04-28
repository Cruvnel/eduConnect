import "../../styles/button.css";

export default function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    onClick,
}) {
    const classes = [
        "ui-btn",
        `ui-btn-${variant}`,
        `ui-btn-${size}`,
        fullWidth ? "ui-btn-full" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? "Carregando..." : children}
        </button>
    );
}