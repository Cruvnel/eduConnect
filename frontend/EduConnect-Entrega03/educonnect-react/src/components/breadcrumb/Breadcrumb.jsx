import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "../../styles/breadcrumb.css";

export default function Breadcrumb({ items = [] }) {
    if (!items.length) return null;

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li
                            key={`${item.label}-${index}`}
                            className={`breadcrumb-item ${isLast ? "active" : ""}`}
                        >
                            {index === 0 && (
                                <span className="breadcrumb-home-icon">
                                    <i className="fas fa-home"></i>
                                </span>
                            )}

                            {isLast || !item.path ? (
                                <span className="breadcrumb-current">{item.label}</span>
                            ) : (
                                <Link to={item.path} className="breadcrumb-link">
                                    {item.label}
                                </Link>
                            )}

                            {!isLast && (
                                <span className="breadcrumb-separator" aria-hidden="true">
                                    <FaChevronRight />
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}