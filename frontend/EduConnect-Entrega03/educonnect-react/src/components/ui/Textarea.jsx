import "../../styles/textarea.css";

export default function Textarea({
    id,
    label,
    value,
    onChange,
    placeholder = "",
    rows = 4,
    required = false,
    disabled = false,
}) {
    return (
        <div className="form-group">
            {label && <label htmlFor={id}>{label}</label>}

            <textarea
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                disabled={disabled}
                className="textarea-field"
            />
        </div>
    );
}