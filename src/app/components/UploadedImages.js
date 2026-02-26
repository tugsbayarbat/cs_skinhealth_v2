export default function UploadedImages({ images, onRemove }) {
    if (!images || images.length === 0) return null;

    return (
        <div className="uploaded-images-strip">
            {images.map((src, index) => (
                <div key={index} className="uploaded-img-item">
                    <img src={src} alt={`Uploaded ${index + 1}`} />
                    <button
                        className="uploaded-img-remove"
                        onClick={() => onRemove(index)}
                        title="Remove image"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
