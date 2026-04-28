import "../../styles/input.css";

export default function Input({
    label,
    id,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    required = false,
    error = "",
    className = "",
    ...props
}) {
    return (
        <div className={`ui-form-group ${className}`}>
            {label && (
                <label htmlFor={id} className="ui-label">
                    {label}
                </label>
            )}

            <input
                id={id}
                name={name || id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`ui-input ${error ? "ui-input-error" : ""}`}
                {...props}
            />

            {error ? <span className="ui-input-feedback">{error}</span> : null}
        </div>
    );
}