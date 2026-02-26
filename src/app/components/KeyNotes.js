export default function KeyNotes({ title = 'Symptom notes', meta }) {
    return (
        <div className="info-card">
            <div className="card-title">{title}</div>
            {meta && <div className="card-meta">{meta}</div>}
        </div>
    );
}
