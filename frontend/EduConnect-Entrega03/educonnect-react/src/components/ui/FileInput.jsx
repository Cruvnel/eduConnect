import "../../styles/fileInput.css";

export default function FileInput({
    id,
    label,
    accept = "",
    onChange,
    required = false,
    disabled = false,
    helperText = "",
}) {
    function handleChange(event) {
        const file = event.target.files?.[0] || null;
        onChange?.(file);
    }

    return (
        <div className="form-group">
            {label && <label htmlFor={id}>{label}</label>}

            <input
                id={id}
                type="file"
                className="file-input-field"
                accept={accept}
                onChange={handleChange}
                required={required}
                disabled={disabled}
            />

            {helperText && (
                <small className="file-input-helper">{helperText}</small>
            )}
        </div>
    );
}