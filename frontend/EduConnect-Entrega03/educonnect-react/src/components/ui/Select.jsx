import "../../styles/select.css";

export default function Select({
    id,
    label,
    value,
    onChange,
    children,
    required = false,
    disabled = false,
}) {
    return (
        <div className="form-group">
            {label && <label htmlFor={id}>{label}</label>}

            <select
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="select-field"
            >
                {children}
            </select>
        </div>
    );
}