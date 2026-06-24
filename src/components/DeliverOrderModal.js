"use client";
import { useState } from "react";
import { Truck, Package, CheckCircle, X, Clock } from "lucide-react";
import "./Modal.css";
import AttachmentList from "./AttachmentList";

export default function DeliverOrderModal({ order, isOpen, onClose, onDelivered }) {
  const [destination, setDestination] = useState("CLIENTE"); // CLIENTE | STOCK_INTERNO
  const [clientName, setClientName] = useState("");
  const [remitoNumber, setRemitoNumber] = useState("");
  const [deliveryType, setDeliveryType] = useState("RETIRO");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (destination === "CLIENTE" && !clientName) {
      alert("Debes ingresar el nombre del cliente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/work-orders/${order.id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          clientName,
          remitoNumber,
          deliveryType,
          address
        })
      });
      if (res.ok) {
        onDelivered();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Error al procesar la entrega");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '950px', width: '100%', padding: '2.5rem' }}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>

        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {order.title}
            <CheckCircle color="var(--success-color)" size={24} />
          </h2>
        </div>

        <p className="text-muted mb-2">
          La orden ha completado todos sus procesos.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
          {/* Columna Izquierda: Detalles e Historial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {order.description && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(230, 57, 70, 0.1)', borderLeft: '4px solid var(--danger-color)', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--danger-color)' }}>Instrucciones Personalizadas:</h4>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{order.description}</p>
              </div>
            )}

            <div className="processes-section" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Historial de Producción</h3>
              <ul className="timeline">
                {order.processes.map((proc, idx) => (
                  <li key={proc.id} className={`timeline-item ${proc.status.toLowerCase()}`}>
                    <div className="timeline-marker">
                      {proc.status === "TERMINADO" ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="timeline-content">
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>{idx + 1}. {proc.processName.replace("_", " ")}</h4>
                      {proc.status === "TERMINADO" && proc.employee && (
                        <p className="operator-info text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                          Realizado por: <strong style={{ color: 'white' }}>{proc.employee.name}</strong> el {new Date(proc.finishedAt).toLocaleDateString()}
                        </p>
                      )}
                      {proc.status === "TERMINADO" && idx === order.processes.length - 1 && (
                        <p className="operator-info text-muted" style={{ margin: 0, fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          Unidades: <strong style={{ color: 'var(--success-color)' }}>{proc.goodQuantity} buenas</strong>, {proc.badQuantity} mermas
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {order.files && order.files.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Archivos y Planos</h3>
                <div style={{ paddingLeft: '1rem' }}>
                  <AttachmentList files={order.files} onUpdateFiles={() => {}} onSystemUpdate={() => {}} />
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Formulario de Finalización */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--accent-color)' }}>Finalizar y Entregar</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group mb-4">
            <label>Destino Final</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                className={`btn ${destination === 'CLIENTE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setDestination('CLIENTE')}
              >
                <Truck size={18} /> Cliente / Despacho
              </button>
              <button 
                type="button"
                className={`btn ${destination === 'STOCK_INTERNO' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setDestination('STOCK_INTERNO')}
              >
                <Package size={18} /> Stock Propio
              </button>
            </div>
          </div>

          {destination === 'CLIENTE' && (
            <div className="fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="form-group">
                  <label>Nombre del Cliente</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)} 
                    placeholder="Ej: Metalúrgica Gómez"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>N° Remito / Factura</label>
                  <input 
                    type="text" 
                    value={remitoNumber} 
                    onChange={e => setRemitoNumber(e.target.value)} 
                    placeholder="0001-00002345"
                  />
                </div>

                <div className="form-group">
                  <label>Modalidad</label>
                  <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)}>
                    <option value="RETIRO">Retira en taller</option>
                    <option value="ENVIO">Envío a domicilio</option>
                  </select>
                </div>

                {deliveryType === "ENVIO" && (
                  <div className="form-group">
                    <label>Dirección de Envío</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      placeholder="Calle Falsa 123"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {destination === 'STOCK_INTERNO' && (
            <div className="fade-in p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <CheckCircle size={32} color="var(--success-color)" style={{ margin: '0 auto 1rem' }} />
              <p>Las unidades terminadas de <strong>{order.title}</strong> se sumarán al inventario de Productos Terminados.</p>
            </div>
          )}

          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Procesando..." : "Confirmar Entrega"}
            </button>
          </div>
        </form>
        </div>
      </div>
      </div>
    </div>
  );
}
