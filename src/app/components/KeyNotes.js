export default function KeyNotes({ title = 'Symptom notes', meta, symptoms }) {
    return (
        <div className="info-card">
            <div className="card-title">{title}</div>
            {meta && <div className="card-meta">{meta}</div>}
            
            {symptoms && Object.keys(symptoms).length > 0 && (
                <div className="symptoms-list" style={{ marginTop: '12px' }}>
                    {Object.entries(symptoms).map(([key, value]) => {
                         if (value === null || value === undefined || value === '') return null;
                         
                         const strValue = Array.isArray(value) ? value.join(', ') : String(value);
                         const displayValue = strValue.charAt(0).toUpperCase() + strValue.slice(1);
                         
                         return (
                             <div key={key} style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.4' }}>
                                 <div style={{ 
                                     textTransform: 'uppercase', 
                                     fontSize: '11px', 
                                     letterSpacing: '0.05em',
                                     color: '#666',
                                     fontWeight: '600',
                                     marginBottom: '2px'
                                 }}>
                                     {key.replace(/_/g, ' ')}
                                 </div>
                                 <div style={{ color: '#222', wordBreak: 'break-word' }}>
                                     {displayValue}
                                 </div>
                             </div>
                         );
                    })}
                </div>
            )}
        </div>
    );
}
