import "../../styles/card.css";

export default function Card({
    children,
    className = "",
    clickable = false,
    onClick,
}) {
    const classes = [
        "ui-card",
        clickable ? "ui-card-clickable" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const Tag = onClick ? "button" : "div";

    return (
        <Tag
            className={classes}
            onClick={onClick}
            type={onClick ? "button" : undefined}
        >
            {children}
        </Tag>
    );
}