import "../../styles/metriccard.css";

export default function MetricCard({
    title,
    bigValue = null,
    lines = [],
    centered = false,
}) {
    return (
        <div className={`metric-card metric-accent ${centered ? "single" : ""}`}>
            <span className="metric-title">{title}</span>

            {
                bigValue !== null ? (
                    <span className="metric-big">{bigValue}</span>
                ) : (
                    lines.map((line, index) => (
                        <div className="metric-line" key={index}>
                            <span className="metric-label">{line.label}</span>
                            <span className="metric-value">{line.value}</span>
                        </div>
                    ))
                )
            }
        </div >
    );
}