"use client";
import { useState } from "react";
import { X, CheckCircle, Package } from "lucide-react";
import "./Modal.css";

export default function BulkDeliverOrderModal({ orders, isOpen, onClose, onDelivered }) {
  const [destination, setDestination] = useState("CLIENTE"); // CLIENTE | STOCK_INTERNO
  const [clientName, setClientName] = useState("");
  const [remitoNumber, setRemitoNumber] = useState("");
  const [deliveryType, setDeliveryType] = useState("RETIRO");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !orders || orders.length === 0) return null;

  const handleDeliver = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        orderIds: orders.map(o => o.id),
        clientName: destination === 'CLIENTE' ? clientName : "STOCK PROPIO",
        remitoNumber: destination === 'CLIENTE' ? remitoNumber : "N/A",
        deliveryType: destination === 'STOCK_INTERNO' ? 'ALTA_STOCK' : deliveryType,
        address: (destination === 'CLIENTE' && deliveryType === "ENVIO") ? address : null
      };

      const res = await fetch(`/api/work-orders/bulk-deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onDelivered();
      } else {
        const d = await res.json();
        alert(d.error || "Error al entregar trabajos");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} /> Entrega Múltiple ({orders.length})
          </h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
          <strong>Trabajos a entregar:</strong>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {orders.map(o => (
              <li key={o.id}>{o.title} <span className="text-muted">({o.expectedQuantity} uds)</span></li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleDeliver} className="modal-form">
          <div className="form-group mb-4">
            <label>Destino Final</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                className={`btn ${destination === 'CLIENTE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setDestination('CLIENTE')}
              >
                Cliente / Despacho
              </button>
              <button 
                type="button"
                className={`btn ${destination === 'STOCK_INTERNO' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setDestination('STOCK_INTERNO')}
              >
                Stock Propio
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
              <p>Los <strong>{orders.length} productos seleccionados</strong> se sumarán al inventario de Productos Terminados.</p>
            </div>
          )}

          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Procesando..." : "Confirmar Entrega en Lote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
