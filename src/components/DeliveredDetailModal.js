"use client";
import { CheckCircle, X, Download, Eye, Layers } from "lucide-react";
import "@/components/Modal.css";

export default function DeliveredDetailModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass scrollable" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '2rem' }}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {order.title}
            <CheckCircle color="var(--success-color)" size={24} />
          </h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--accent-color)' }}>
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Pedidas: <strong>{order.expectedQuantity}</strong>
            </span>
            {order.thickness && (
              <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                Material: <strong>{order.material ? `${order.material} - ` : ''}{order.thickness}</strong>
              </span>
            )}
          </div>
        </div>

        {order.description && (
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderLeft: '4px solid var(--accent-color)', marginBottom: '1rem', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>Instrucciones Personalizadas:</h4>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{order.description}</p>
          </div>
        )}

        <div className="processes-section">
          <h3>Secuencia de Producción</h3>
          <ul className="timeline">
            {order.processes && order.processes.map((proc, idx) => (
              <li key={proc.id} className="timeline-item terminado">
                <div className="timeline-marker">
                  <CheckCircle size={16} />
                </div>
                <div className="timeline-content">
                  <h4>{idx + 1}. {proc.processName.replace("_", " ")}</h4>
                  {proc.employee && (
                    <p className="operator-info text-muted">
                      Hecho por: {proc.employee.name} el {new Date(proc.finishedAt).toLocaleDateString()}
                    </p>
                  )}
                  {idx === order.processes.length - 1 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--success-color)', marginTop: '0.2rem' }}>
                      Buenas: {proc.goodQuantity} | Mermas: {proc.badQuantity}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="files-section mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
          <h3>Archivos y Planos de Producción</h3>
          {!order.files || order.files.length === 0 ? (
            <p className="text-muted">No hay archivos adjuntos.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
              {order.files.map(f => (
                <div key={f.id} className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a href={f.url} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', flex: 1 }}>
                      <strong>{f.name}</strong>
                    </a>
                    <a href={f.url} download className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }} title="Descargar original">
                      <Download size={14} />
                    </a>
                  </div>
                  
                  {f.type === "DXF" && (
                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
                      <img 
                        src={`${f.url}.svg`} 
                        alt="Vista previa SVG" 
                        style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <a href={`${f.url}.svg`} target="_blank" rel="noreferrer" className="btn btn-primary w-100 mt-2" style={{ padding: '0.2rem', fontSize: '0.8rem' }}>
                        <Eye size={14} style={{ marginRight: '0.2rem' }} /> Ver a Pantalla Completa
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
