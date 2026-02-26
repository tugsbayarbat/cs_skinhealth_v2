export default function QuickSummary({ title = 'Quick summary', meta }) {
    return (
        <div className="info-card">
            <div className="card-title">{title}</div>
            {meta && <div className="card-meta">{meta}</div>}
        </div>
    );
}
