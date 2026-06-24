"use client";
import { useState, useEffect } from "react";
import { CheckCircle, X, Layers, Clock, Box, Trash2 } from "lucide-react";
import "./Modal.css";
import FileUploader from "./FileUploader";
import AttachmentList from "./AttachmentList";

export default function WorkOrderDetailModal({ order, isOpen, onClose, onUpdated, employees = [] }) {
  const [loading, setLoading] = useState(false);
  const [goodQty, setGoodQty] = useState("");
  const [badQty, setBadQty] = useState(0);
  const [pin, setPin] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [resolutionDesc, setResolutionDesc] = useState("");
  const [isPausing, setIsPausing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePin, setDeletePin] = useState("");
  
  // order.files vendrá si lo pedimos en el GET
  const [orderFiles, setOrderFiles] = useState(order?.files || []);
  
  // Actualizar orderFiles cuando order cambia
  useEffect(() => {
    if (order) setOrderFiles(order.files || []);
  }, [order]);

  if (!isOpen || !order) return null;

  const currentProcess = order.processes.find(p => p.status !== "TERMINADO");
  
  // Determinar si es el último proceso
  const isLastProcess = currentProcess && order.processes[order.processes.length - 1].id === currentProcess.id;

  const handleAdvance = async () => {
    if (!pin) {
      alert("Debes ingresar tu PIN de operario para firmar este avance.");
      return;
    }
    
    // Si es el último proceso, pedimos buenas/malas obligatoriamente
    if (isLastProcess) {
      if (goodQty === "" || badQty === "") {
        alert("Debes ingresar las cantidades de piezas buenas y mermas (0 si no hubo).");
        return;
      }
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/work-orders/${order.id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pin, 
          goodQuantity: isLastProcess ? parseInt(goodQty) : 0, 
          badQuantity: isLastProcess ? parseInt(badQty) : 0 
        })
      });
      
      if (res.ok) {
        setPin("");
        setGoodQty("");
        setBadQty(0);
        onUpdated();
        if (isLastProcess) onClose();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al avanzar");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!pin) return alert("Debes ingresar tu PIN para reportar un problema.");
    if (!issueDesc.trim()) return alert("Debes escribir el motivo de la revisión.");
    
    setLoading(true);
    try {
      const res = await fetch(`/api/work-orders/${order.id}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, issueDescription: issueDesc })
      });
      if (res.ok) {
        setPin("");
        setIssueDesc("");
        setIsPausing(false);
        onUpdated();
      } else {
        const d = await res.json();
        alert(d.error || "Error al pausar");
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/work-orders/${order.id}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionDescription: resolutionDesc })
      });
      if (res.ok) {
        setResolutionDesc("");
        setIsResolving(false);
        onUpdated();
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePin) return alert("Se requiere PIN para eliminar");
    if (!confirm("¿ESTÁS SEGURO? Se eliminará este trabajo por completo y esto no se puede deshacer.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/work-orders/${order.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: deletePin })
      });
      if (res.ok) {
        onUpdated();
        onClose();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al eliminar");
      }
    } catch(e) {
      console.error(e);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const isFullyFinished = order.processes.every(p => p.status === "TERMINADO");

  const handleChangePriority = async (newPriority) => {
    try {
      const res = await fetch(`/api/work-orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority })
      });
      if (res.ok) {
        onUpdated(); // Recargar tablero
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '2rem' }}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {order.title}
              {isFullyFinished && <CheckCircle color="var(--success-color)" size={24} />}
            </h2>
            <select 
              value={order.priority} 
              onChange={(e) => handleChangePriority(e.target.value)}
              className="badge" 
              style={{ marginRight: '2.5rem', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
            >
              <option value="BAJA">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--accent-color)' }}>
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Cantidad Pedida: <strong>{order.expectedQuantity}</strong>
            </span>
            {order.thickness && (
              <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                Material: <strong>{order.material ? `${order.material} - ` : ''}{order.thickness}</strong>
              </span>
            )}
          </div>
        </div>

        {order.description && (
          <div style={{ padding: '1rem', background: 'rgba(230, 57, 70, 0.1)', borderLeft: '4px solid var(--danger-color)', marginBottom: '1rem', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--danger-color)' }}>Instrucciones Personalizadas:</h4>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{order.description}</p>
          </div>
        )}

        <div className="processes-section">
          <h3>Secuencia de Producción</h3>
          <ul className="timeline">
            {order.processes.map((proc, idx) => (
              <li key={proc.id} className={`timeline-item ${proc.status.toLowerCase()}`}>
                <div className="timeline-marker">
                  {proc.status === "TERMINADO" ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div className="timeline-content">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {idx + 1}. {proc.processName.replace("_", " ")}
                    {(proc.status === "EN_CURSO" || (proc.status === "PENDIENTE" && (idx === 0 || order.processes[idx - 1].status === "TERMINADO"))) && (
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: 'var(--accent-color)', borderRadius: '4px', color: 'white' }}>
                        Paso Actual
                      </span>
                    )}
                    {proc.status === "PAUSADO" && (
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: 'var(--danger-color)', borderRadius: '4px', color: 'white' }}>
                        EN REVISIÓN
                      </span>
                    )}
                  </h4>
                  <p className="status-text" style={{ color: proc.status === 'PAUSADO' ? 'var(--danger-color)' : 'inherit' }}>{proc.status}</p>
                  
                  {proc.issueDescription && (
                    <div style={{ background: 'rgba(230,57,70,0.1)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--danger-color)' }}>Problema:</strong> {proc.issueDescription}
                      {proc.resolutionDescription && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          <strong style={{ color: 'var(--success-color)' }}>Solución:</strong> {proc.resolutionDescription}
                        </div>
                      )}
                    </div>
                  )}

                  {proc.status === "TERMINADO" && proc.employee && (
                    <p className="operator-info text-muted">
                      Hecho por: {proc.employee.name} el {new Date(proc.finishedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {!isFullyFinished && currentProcess && currentProcess.status !== "PAUSADO" && (
          <div className="action-section mt-4 glass-card p-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>📝 Registrar Avance: {currentProcess.processName.replace("_", " ")}</h3>
              <button className="btn btn-icon-danger" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }} onClick={() => setIsPausing(!isPausing)}>
                ⚠️ Problema / Pausa
              </button>
            </div>

            {isPausing && (
              <div style={{ padding: '1rem', background: 'rgba(230,57,70,0.1)', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--danger-color)' }}>
                <h4 style={{ color: 'var(--danger-color)', margin: '0 0 0.5rem 0' }}>Mandar a Revisión</h4>
                <div className="form-group">
                  <label>Motivo del problema</label>
                  <textarea 
                    value={issueDesc} 
                    onChange={e => setIssueDesc(e.target.value)} 
                    placeholder="Ej: Falta plano de soldadura, la máquina falló, etc."
                    rows="2"
                  />
                </div>
                <div className="form-group mt-2">
                  <label>PIN para firmar revisión</label>
                  <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} />
                </div>
                <button className="btn btn-danger mt-2" onClick={handlePause} disabled={loading || !issueDesc || !pin}>
                  {loading ? "Pausando..." : "Confirmar Pausa"}
                </button>
              </div>
            )}

            {!isPausing && (
              <>
                <p className="text-muted" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
                  Meta del trabajo: <strong>{order.expectedQuantity} piezas</strong>
                </p>
                
                <div className="form-group mt-2">
                  <label>Firma del Operario (PIN)</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    value={pin} 
                    onChange={(e) => setPin(e.target.value)} 
                    placeholder="Ingresa tu PIN secreto de 4 dígitos"
                    style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.2em' }}
                  />
                </div>

                {isLastProcess && (
                  <div className="form-row mt-3">
                    <div className="form-group flex-1">
                      <label>Piezas Buenas 🟢</label>
                      <input 
                        type="number" 
                        min="0"
                        value={goodQty} 
                        onChange={(e) => setGoodQty(e.target.value)} 
                        placeholder={`Ej: ${order.expectedQuantity}`}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Piezas Malas / Merma 🔴</label>
                      <input 
                        type="number" 
                        min="0"
                        value={badQty} 
                        onChange={(e) => setBadQty(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                {isLastProcess && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginTop: '0.5rem' }}>
                    * Al ser el último paso, se registrará el stock final y se descontarán las mermas extra de chapa si hubo.
                  </p>
                )}

                <button className="btn btn-primary mt-4 w-100" onClick={handleAdvance} disabled={loading}>
                  {loading ? "Procesando..." : `Terminar paso y firmar`}
                </button>
              </>
            )}
          </div>
        )}

        {currentProcess && currentProcess.status === "PAUSADO" && (
          <div className="action-section mt-4 glass-card p-3" style={{ border: '1px solid var(--danger-color)' }}>
            <h3 style={{ color: 'var(--danger-color)' }}>⚠️ Trabajo en Revisión</h3>
            <p>Este trabajo está pausado. Alguien de la oficina debe revisarlo, aportar la solución y reanudarlo.</p>
            
            <button className="btn btn-secondary mt-2" onClick={() => setIsResolving(!isResolving)}>
              Resolver Problema (Oficina)
            </button>

            {isResolving && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="form-group">
                  <label>Solución aplicada</label>
                  <textarea 
                    value={resolutionDesc}
                    onChange={e => setResolutionDesc(e.target.value)}
                    placeholder="Ej: Plano añadido al sistema. Ya se puede soldar."
                    rows="2"
                  />
                </div>
                <button className="btn btn-primary mt-2" onClick={handleResume} disabled={loading || !resolutionDesc}>
                  {loading ? "Reanudando..." : "✅ Reanudar Trabajo"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="form-group mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
          <label>Archivos y Planos de Producción</label>
          <FileUploader 
            targetId={order.id} 
            targetType="WORK_ORDER" 
            onUploadSuccess={(file) => {
              setOrderFiles([...orderFiles, file]);
              onUpdated();
            }} 
          />
          <AttachmentList 
            files={orderFiles} 
            onUpdateFiles={setOrderFiles} 
            onSystemUpdate={onUpdated} 
          />
        </div>

        <div className="action-section mt-4" style={{ textAlign: 'right', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          {!isDeleting ? (
            <button className="btn btn-icon-danger" style={{ border: '1px solid var(--danger-color)', padding: '0.4rem 1rem' }} onClick={() => setIsDeleting(true)}>
              <Trash2 size={16} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }} /> Eliminar Trabajo
            </button>
          ) : (
            <div style={{ background: 'rgba(230,57,70,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--danger-color)', display: 'inline-block', textAlign: 'left' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--danger-color)', fontWeight: 'bold' }}>Confirmar Eliminación</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="password" 
                  maxLength={4} 
                  value={deletePin} 
                  onChange={e => setDeletePin(e.target.value)} 
                  placeholder="PIN operario" 
                  style={{ width: '120px', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--danger-color)', background: 'transparent', color: 'white' }}
                />
                <button className="btn btn-danger" onClick={handleDelete} disabled={loading || !deletePin}>
                  Borrar Definitivamente
                </button>
                <button className="btn btn-secondary" onClick={() => setIsDeleting(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
